const routes = [
  {
    path: '/',
    component: () => import('layouts/MainLayout.vue'),
    children: [{ path: '', component: () => import('pages/Index.vue') }]
  },
  {
    path: '/login',
    component: () => import('layouts/LoginLayout.vue'),
    children: [{ name: 'Login', path: '', component: () => import('pages/Login.vue') }]
  },
  {
    path: '/register',
    component: () => import('layouts/LoginLayout.vue'),
    children: [{ name: 'Register', path: '', component: () => import('pages/Login.vue') }]
  }
];

// Always leave this as last one
if (process.env.MODE !== 'ssr') {
  routes.push({
    path: '*',
    component: () => import('pages/Error404.vue')
  });
}

export default routes;
