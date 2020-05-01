import { AuthService } from '@/services/auth';

// eslint-disable-next-line no-unused-vars
export default ({ router, store, Vue }) => {
  router.beforeEach((to, from, next) => {
    const record = to.matched.find(AuthService.requireAuth);
    if (record) {
      if (record.meta.redirect) {
        return next(record.meta.redirect);
      }
      return next({
        name: 'login',
        replace: true,
        query: { redirect: to.fullPath }
      });
    }
    return next();
  });

  AuthService.load(router);

  Vue.prototype.$auth = AuthService;
};
