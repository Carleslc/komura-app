import gql from 'graphql-tag';
import { topicsLabelColumnNotDefault } from '@/graphql/getTopics';

export const createRootGroup = gql`
  mutation createRootGroup(
    $owner: String!
    $name: String!
    $slug: String!
    $description: String
    $banner: String
    $topics: [group_topics_insert_input!]!
  ) {
    insert_groups(
      objects: {
        name: $name
        path: $slug
        description: $description
        banner: $banner
        owner_id: $owner
        topics: { data: $topics }
      }
    ) {
      returning {
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
  }
`;
