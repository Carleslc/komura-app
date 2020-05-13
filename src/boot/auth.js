import { firebaseAuth } from '@/boot/firebase';
import AuthService from '@/services/auth';

export default ({ router, Vue }) => {
  const auth = new AuthService(firebaseAuth, router);

  router.beforeEach((to, _from, next) => {
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
