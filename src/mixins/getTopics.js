import { locale } from 'src/i18n';
import { words, similar, getRandomColor } from '@/utils/strings';
import { debounce } from 'lodash';
import gql from 'graphql-tag';

export const getTopics = {
  data() {
    return {
      topics: {},
      selectedTopics: [],
      suggestedTopics: [],
      topicColors: {}
    };
  },
  apollo: {
    topics() {
      const localeColumn = locale === 'en' ? 'name' : locale; // name column values are in English

      return {
        query: gql`
          query getTopics {
            topics {
              parent
              name
              ${localeColumn !== 'name' ? localeColumn : ''}
            }
          }
        `,
        update(data) {
          return data.topics.reduce((topics, topic) => {
            topics[topic.name] = {
              parent: topic.parent,
              value: topic.name,
              label: topic[localeColumn] || topic.name
            };
            return topics;
          }, {});
        },
        result(data) {
          if (data.stale !== undefined) {
            // call after cache
            this.updateSuggestedTopics();
          }
        }
      };
    }
  },
  created() {
    this.debounceUpdateSuggestedTopics = debounce(this.updateSuggestedTopics, 300);
  },
  watch: {
    search() {
      this.debounceUpdateSuggestedTopics();
    },
    selectedTopics() {
      this.debounceUpdateSuggestedTopics();
    }
  },
  methods: {
    updateSuggestedTopics() {
      const suggestions = new Set();

      const topics = Object.values(this.topics);

      // similar topics: with a word match
      const searchWords = words(this.search.toLowerCase()).filter(w => w.length > 2);

      topics
        .filter(
          topic =>
            similar(searchWords, words(topic.label.toLowerCase())) ||
            similar(searchWords, words(topic.value.toLowerCase()))
        )
        .forEach(suggestions.add, suggestions);

      const selectedTopics = this.selectedTopics.map(value => this.topics[value]);

      // parent topics of selected and similar topics
      [...selectedTopics, ...suggestions].forEach(topic => {
        let parentTopic = this.topics[topic.parent];
        while (parentTopic) {
          suggestions.add(parentTopic);
          parentTopic = this.topics[parentTopic.parent];
        }
      });

      // related topics (selected children topics)
      topics
        .filter(topic => topic.parent && this.selectedTopics.includes(topic.parent))
        .forEach(suggestions.add, suggestions);

      const newSuggestedTopics = [
        // already suggested topics
        ...this.suggestedTopics.filter(
          topic => suggestions.has(topic) || this.selectedTopics.includes(topic.value)
        )
      ];
      // selected topics + suggestions
      [...selectedTopics, ...suggestions].forEach(topic => {
        if (!newSuggestedTopics.includes(topic)) {
          newSuggestedTopics.push(topic);
        }
      });

      newSuggestedTopics.forEach(topic => {
        let color = this.topicColors[topic.value];
        if (!color) {
          color = getRandomColor();
          this.topicColors[topic.value] = color;
        }
        topic.color = color;
      });

      this.suggestedTopics = newSuggestedTopics;

      // suggestions + unselected root topics
      this.topicsSelectList = [
        ...suggestions,
        ...topics.filter(
          topic =>
            !topic.parent && !this.selectedTopics.includes(topic.value) && !suggestions.has(topic)
        )
      ];
    }
  }
};
