export const isLoggedIn = {
  data() {
    return {
      isLoggedIn: this.$auth.isLoggedIn()
    };
  },
  created() {
    this.unsubscribeonAuthStateChanged = this.$auth.firebaseAuth.onAuthStateChanged(
      firebaseUser => {
        this.isLoggedIn = !!firebaseUser;
      }
    );
  },
  beforeDestroy() {
    this.unsubscribeonAuthStateChanged();
  }
};
