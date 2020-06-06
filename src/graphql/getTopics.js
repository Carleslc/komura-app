import gql from 'graphql-tag';
import { language } from 'src/i18n';

export const topicsLabelColumn = language === 'en' ? 'name' : language; // name column values are in English

export const topicsLabelColumnNotDefault = topicsLabelColumn !== 'name' ? topicsLabelColumn : '';

export const getTopics = gql`
  query getTopics {
    topics(order_by: { ${topicsLabelColumn}: asc }) {
      parent
      name
      ${topicsLabelColumnNotDefault}
    }
  }
`;
