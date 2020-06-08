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
      @add="selectTopic"
    >
      <template v-slot:option="scope">
        <q-item v-bind="scope.itemProps" v-on="scope.itemEvents">
          <q-item-section>
            <q-item-label :class="{ 'text-italic': scope.opt.isNew }">
              {{ scope.opt.label }}
            </q-item-label>
          </q-item-section>
        </q-item>
      </template>
    </q-select>
    <q-option-group
      v-model="selectedTopics"
      :options="suggestedTopics"
      type="checkbox"
      :inline="!xxs"
    />
  </k-field>
</template>

<script>
import { alphaLower, removeSpecial, words, similar, similarWords } from '@/utils/strings';
import { getRandomColor } from '@/utils/colors';
import { getTopics, topicsLabelColumn } from '@/graphql/getTopics';
import debounce from 'lodash.debounce';
import capitalize from 'lodash.capitalize';
import screen from '@/mixins/screen';

export default {
  components: {
    'k-field': require('components/KField').default
  },
  mixins: [screen],
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
      maxTopics: 10,
      newTopic: undefined
    };
  },
  apollo: {
    topics() {
      return {
        query: getTopics,
        update(data) {
          this.topicsByName = data.topics.reduce((topics, topic) => {
            const formatted = {
              parent: topic.parent,
              value: topic.name,
              label: topic[topicsLabelColumn] || topic.name
            };
            topics[topic.name] = {
              ...formatted,
              valueAlpha: alphaLower(formatted.value),
              labelAlpha: alphaLower(formatted.label)
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
    },
    selectedTopicsObjects() {
      return this.selectedTopics.map(
        name => this.topicsByName[name] || this.addLocalTopic(this.buildTopic(name))
      );
    },
    similarWordsTopicsToSearch() {
      return this.similarWordsTopics(this.search);
    }
  },
  watch: {
    search() {
      this.debounceUpdateSuggestedTopics();
    },
    selectedTopics() {
      this.$emit('update', this.selectedTopicsObjects);
      this.updateSuggestedTopics();
    }
  },
  created() {
    this.debounceUpdateSuggestedTopics = debounce(this.updateSuggestedTopics, 300);
  },
  methods: {
    similarWordsTopics(s, raw = false) {
      const alphaWords = words(raw ? s : alphaLower(s)).filter(w => w.length > 2);
      return this.topics.filter(
        topic =>
          similarWords(alphaWords, words(topic.labelAlpha)) ||
          similarWords(alphaWords, words(topic.valueAlpha))
      );
    },
    similarTopics(s, raw = false) {
      const alphaS = raw ? s : alphaLower(s);

      return this.topics.filter(
        topic => similar(alphaS, topic.labelAlpha) || similar(alphaS, topic.valueAlpha)
      );
    },
    updateSuggestedTopics() {
      const suggestions = new Set();

      // topics with a word match
      this.similarWordsTopicsToSearch.forEach(suggestions.add, suggestions);

      // parent topics of selected and similar topics
      [...this.selectedTopicsObjects, ...suggestions].forEach(topic => {
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
      this.selectedTopicsObjects.forEach(topic => {
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
    canAddNewTopic(val, topics) {
      return (
        val.length > 2 &&
        topics.every(topic => val !== topic.valueAlpha && val !== topic.labelAlpha)
      );
    },
    filterSearchTopics(val, update) {
      update(
        () => {
          const searchAlpha = alphaLower(val);
          if (searchAlpha.length > 0) {
            let filteredTopics = this.similarTopics(searchAlpha, true);

            if (filteredTopics.length === 0) {
              Array.prototype.push.apply(
                filteredTopics,
                this.similarWordsTopics(searchAlpha, true).filter(
                  topic => !filteredTopics.includes(topic.value)
                )
              );
            }

            if (this.canAddNewTopic(searchAlpha, filteredTopics)) {
              this.newTopic = this.buildTopic(val, searchAlpha);
              this.newTopic.isNew = true;
              filteredTopics = [this.newTopic, ...filteredTopics];
            }

            this.topicsFilter = filteredTopics;
          } else {
            this.topicsFilter = this.topicsSelectList;
          }
        },
        ref => {
          if (val && ref.options.length === 1) {
            ref.setOptionIndex(-1); // reset selection if there is something selected
            ref.moveOptionSelection(1, true); // focus the first selectable option
          }
        }
      );
    },
    isNewTopic(topic) {
      return this.newTopic && topic === this.newTopic.value;
    },
    selectTopic(topic) {
      // Check if topic is new
      if (this.isNewTopic(topic.value)) {
        this.addLocalTopic(this.newTopic);
        this.newTopic = undefined;
      }
      // Close popup
      this.$refs.topicsSelect.hidePopup();
    },
    buildTopic(name, nameAlpha) {
      name = capitalize(removeSpecial(name));
      if (!nameAlpha) {
        nameAlpha = alphaLower(name);
      }
      return {
        value: name,
        label: name,
        labelAlpha: nameAlpha,
        valueAlpha: nameAlpha,
        isLocal: true
      };
    },
    addLocalTopic(topic) {
      topic.isNew = false;
      this.topics.push(topic);
      this.topicsByName[topic.value] = topic;
      return topic;
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
