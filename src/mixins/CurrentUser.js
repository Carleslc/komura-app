export const CurrentUser = {
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
