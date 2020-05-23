export const currentUser = {
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
