import { firebaseAuth } from '@/boot/firebase';
import AuthService from '@/services/auth';

function redirectWithParams(next, record, to) {
  return next({
    params: { ...to.params },
    ...record.meta.redirect
  });
}

// Start with most inner children (meta overriding)
function findAuthRecord(to) {
  for (let i = to.matched.length - 1; i >= 0; i--) {
    if (to.matched[i].meta.auth !== undefined) {
      return to.matched[i];
    }
  }
  return undefined;
}

export default ({ router, Vue }) => {
  const auth = new AuthService(firebaseAuth, router);

  router.beforeEach((to, _from, next) => {
    const record = findAuthRecord(to);
    if (record) {
      const loggedIn = auth.isLoggedIn();
      if (record.meta.auth) {
        if (!loggedIn) {
          if (record.meta.redirect) {
            return redirectWithParams(next, record, to);
          }
          return next({
            name: 'login',
            replace: true,
            query: { signInSuccessUrl: to.path }
          });
        }
      } else if (loggedIn && record.meta.redirect) {
        return redirectWithParams(next, record, to);
      }
    }
    return next();
  });

  Vue.prototype.$auth = auth;
};
