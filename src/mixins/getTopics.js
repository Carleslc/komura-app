import { locale } from 'src/i18n';
import { words, similar, similarWords, getRandomColor } from '@/utils/strings';
import { debounce } from 'lodash';
import gql from 'graphql-tag';

export const getTopics = {
  data() {
    return {
      topics: [],
      topicsByName: {},
      selectedTopics: [],
      suggestedTopics: [],
      topicsSelectList: []
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
          this.topicsByName = data.topics.reduce((topics, topic) => {
            topics[topic.name] = {
              parent: topic.parent,
              value: topic.name,
              label: topic[localeColumn] || topic.name
            };
            return topics;
          }, {});
          return Object.values(this.topicsByName);
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

      // similar topics: with a word match
      const searchWords = words(this.search.toLowerCase()).filter(w => w.length > 2);

      this.topics
        .filter(
          topic =>
            similarWords(searchWords, words(topic.label.toLowerCase())) ||
            similarWords(searchWords, words(topic.value.toLowerCase()))
        )
        .forEach(suggestions.add, suggestions);

      const selectedTopics = this.selectedTopics.map(value => this.topicsByName[value]);

      // parent topics of selected and similar topics
      [...selectedTopics, ...suggestions].forEach(topic => {
        let parentTopic = this.topicsByName[topic.parent];
        while (parentTopic) {
          suggestions.add(parentTopic);
          parentTopic = this.topicsByName[parentTopic.parent];
        }
      });

      // related topics (selected children topics)
      this.topics
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
        if (!topic.color) {
          topic.color = getRandomColor();
        }
      });

      this.suggestedTopics = newSuggestedTopics;

      // unselected suggestions + root topics
      this.topicsSelectList = [
        ...suggestions,
        ...this.topics.filter(topic => !topic.parent && !suggestions.has(topic))
      ].filter(topic => !this.selectedTopics.includes(topic.value));
    },
    filterSearchTopics(val, update /* abort */) {
      update(() => {
        const s = val.toLowerCase();
        this.topicsSelectList = this.topics.filter(
          topic => similar(s, topic.label) || similar(s, topic.value)
        );
      });
    }
  }
};
