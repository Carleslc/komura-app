<template>
  <k-field label="topics" hint="selectTopics">
    <q-select
      ref="topicsSelect"
      v-model="selectedTopics"
      filled
      dense
      options-dense
      multiple
      use-input
      emit-value
      hide-selected
      bottom-slots
      hide-bottom-space
      :options="Object.freeze(topicsFilter)"
      :placeholder="$t('searchTopics')"
      :hint="limitHint"
      :counter="!!limitHint"
      :max-values="maxTopics"
      class="q-mb-md"
      popup-content-class="filter-options"
      input-debounce="200"
      @filter="filterSearchTopics"
      @add="closePopup"
    />
    <q-option-group
      v-model="selectedTopics"
      :options="suggestedTopics"
      type="checkbox"
      :inline="$q.screen.width >= 350"
    />
  </k-field>
</template>

<script>
import { locale } from 'src/i18n';
import { words, similar, similarWords, getRandomColor } from '@/utils/strings';
import { debounce } from 'lodash';
import gql from 'graphql-tag';

export default {
  components: {
    'k-field': require('components/KField').default
  },
  props: {
    value: {
      type: Array,
      required: true
    },
    search: {
      type: String,
      default: ''
    }
  },
  data() {
    return {
      topics: [],
      topicsByName: {},
      suggestedTopics: [],
      topicsFilter: [],
      maxTopics: 10
    };
  },
  computed: {
    selectedTopics: {
      get() {
        return this.value;
      },
      set(value) {
        if (value.length <= this.maxTopics) {
          this.$emit('input', value);
        }
      }
    },
    limitHint() {
      if (this.selectedTopics.length >= 0.8 * this.maxTopics) {
        return this.$t('limitTopics', { max: this.maxTopics });
      }
      return undefined;
    }
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
  watch: {
    search() {
      this.debounceUpdateSuggestedTopics();
    },
    selectedTopics() {
      this.updateSuggestedTopics();
    }
  },
  created() {
    this.debounceUpdateSuggestedTopics = debounce(this.updateSuggestedTopics, 300);
  },
  methods: {
    closePopup() {
      if (this.$refs.topicsSelect) {
        this.$refs.topicsSelect.hidePopup();
      }
    },
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

      const selectedTopics = this.selectedTopics.map(name => this.topicsByName[name]);

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

      // selected topics
      selectedTopics.forEach(topic => {
        if (!newSuggestedTopics.includes(topic)) {
          newSuggestedTopics.push(topic);
        }
      });

      // suggestions
      [...suggestions].forEach(topic => {
        if (newSuggestedTopics.length < this.maxTopics && !newSuggestedTopics.includes(topic)) {
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
    filterSearchTopics(val, update) {
      update(() => {
        const s = val.toLowerCase();
        if (s.length > 0) {
          this.topicsFilter = this.topics.filter(
            topic => similar(s, topic.label) || similar(s, topic.value)
          );
        } else {
          this.topicsFilter = this.topicsSelectList;
        }
      });
    }
  }
};
</script>

<style lang="scss">
.q-option-group--inline > div {
  margin: 0;

  @media (min-width: $breakpoint-xxs-min) {
    width: 50%;
  }
  @media (min-width: $breakpoint-md-min) {
    width: 33.33%;
  }
}

.drawer-hidden {
  .q-option-group--inline > div {
    @media (min-width: $breakpoint-sm-min) {
      width: 33.33%;
    }
  }
  .split {
    .q-option-group--inline > div {
      @media (min-width: $breakpoint-lg-min) {
        width: 33.33%;
      }
    }
  }
}

.split {
  .q-option-group--inline > div {
    @media (min-width: $breakpoint-sm-min) {
      width: 50%;
    }
    @media (min-width: $breakpoint-xl-min) {
      width: 33.33%;
    }
  }
}
</style>
