const routes = [
  {
    path: '/',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      {
        name: 'home',
        path: '',
        component: () => import('pages/Home.vue'),
        meta: { auth: true, redirect: { name: 'index' } }
      }
    ]
  },
  {
    path: '/',
    component: () => import('layouts/MainLayout.vue'),
    children: [{ name: 'index', path: '', component: () => import('pages/Index.vue') }]
  },
  {
    path: '/login',
    component: () => import('layouts/LoginLayout.vue'),
    children: [{ name: 'login', path: '', props: true, component: () => import('pages/Login.vue') }],
    meta: { auth: false, redirect: { name: 'home' } }
  },
  {
    path: '/register',
    component: () => import('layouts/LoginLayout.vue'),
    children: [{ name: 'register', path: '', props: true, component: () => import('pages/Register.vue') }],
    meta: { auth: false, redirect: { name: 'home' } }
  },
  {
    path: '/restricted',
    component: () => import('layouts/MainLayout.vue'),
    children: [{ path: '', props: true, component: () => import('pages/Home.vue'), meta: { auth: true } }]
  }
];

// Always leave this as last one
if (process.env.MODE !== 'ssr') {
  routes.push({
    path: '*',
    component: () => import('layouts/MainLayout.vue'),
    children: [{ path: '', component: () => import('pages/Error404.vue') }]
  });
}

export default routes;
