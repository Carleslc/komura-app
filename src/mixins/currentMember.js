import currentUser from '@/mixins/currentUser';

export default {
  mixins: [currentUser],
  data() {
    return {
      currentMember: {}
    };
  },
  watch: {
    group() {
      this.$apollo
        .query({
          skip: !this.group.id || !this.$auth.isLoggedIn,
          query: require('@/graphql/getMemberById.gql'),
          variables: {
            user: this.currentUser.id,
            group: this.group.id
          }
        })
        .then(({ data }) => {
          const member = data.members_by_pk;
          this.currentMember = {
            admin: member.role === 'admin',
            ...member
          };
        });
    }
  }
};
