import gql from 'graphql-tag';
import { topicsLabelColumnNotDefault } from '@/graphql/getTopics';

export const getGroup = gql`
  query getGroup($path: String!) {
    groups(where: { path: { _eq: $path }, type: { _eq: group } }) {
      id
      path
      name
      description
      image
      banner
      is_public
      is_accessible
      created_at
      topics {
        topic {
          name
          ${topicsLabelColumnNotDefault}
        }
      }
    }
  }
`;
