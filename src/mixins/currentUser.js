export default {
  data() {
    return {
      currentUser: {}
    };
  },
  apollo: {
    currentUser: {
      query: require('@/graphql/client/getCurrentUser.gql')
    }
  }
};
