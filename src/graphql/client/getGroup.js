import gql from 'graphql-tag';
import { topicsLabelColumn } from '@/graphql/getTopics';

export const getClientGroup = gql`
  query getGroup($path: String!) {
    group(path: $path) @client {
      path
      name
      description
      image
      banner
      is_public
      is_accessible
      created_at
      topics {
        name
        label
      }
    }
  }
`;

export function toClientGroup(group) {
  return {
    ...group,
    topics: group.topics.map(({ topic }) => ({
      name: topic.name,
      label: topic[topicsLabelColumn] || topic.name,
      __typename: 'Topic'
    }))
  };
}
