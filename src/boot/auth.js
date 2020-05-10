import { firebaseAuth } from '@/boot/firebase';
import AuthService from '@/services/auth';

// eslint-disable-next-line no-unused-vars
export default ({ app, router, store, Vue }) => {
  const auth = new AuthService(app, firebaseAuth, router);

  router.beforeEach((to, from, next) => {
    const record = to.matched.find(r => r.meta.auth !== undefined);
    if (record) {
      const loggedIn = auth.isLoggedIn();
      if (record.meta.auth) {
        if (!loggedIn) {
          if (record.meta.redirect) {
            return next(record.meta.redirect);
          }
          return next({
            name: 'login',
            replace: true,
            query: { signInSuccessUrl: to.path }
          });
        }
      } else if (loggedIn && record.meta.redirect) {
        return next(record.meta.redirect);
      }
    }
    return next();
  });

  Vue.prototype.$auth = auth;
};
