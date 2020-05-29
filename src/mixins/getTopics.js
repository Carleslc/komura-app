import { locale } from 'src/i18n';
import { words, similar } from '@/utils/strings';
import gql from 'graphql-tag';

export const getTopics = {
  data() {
    return {
      topics: []
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
          return data.topics.map(topic => {
            return {
              parent: topic.parent,
              name: topic.name,
              localized: topic[localeColumn] || topic.name
            };
          });
        }
      };
    }
  },
  methods: {
    getSuggestedTopics(search = '') {
      const unselected = this.topics.filter(topic => !this.selectedTopics.has(topic.name)); // unselected

      const searchWords = words(search.toLowerCase()).filter(w => w.length > 2);
      const suggestions = unselected.filter(
        // similar topics: with a word match
        topic =>
          similar(searchWords, words(topic.localized.toLowerCase())) ||
          similar(searchWords, words(topic.name.toLowerCase()))
      );

      // parent topics of similar topics
      suggestions.forEach(topic => {
        let parentTopic = topic;
        while (parentTopic && parentTopic.parent) {
          // eslint-disable-next-line no-loop-func
          parentTopic = unselected.find(t => t.name === parentTopic.parent);
          suggestions.push(parentTopic);
        }
      });

      Array.prototype.push.apply(
        suggestions,
        unselected.filter(topic => topic.parent && this.selectedTopics.has(topic.parent))
      ); // related topics

      if (this.selectedTopics.size === 0 && suggestions.length === 0) {
        Array.prototype.push.apply(
          suggestions,
          unselected.filter(topic => !topic.parent)
        ); // root topics
      }

      return new Set(suggestions.map(topic => topic.localized));
    }
  }
};
