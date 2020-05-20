const routes = [
  {
    path: '/',
    component: () => import('layouts/HomeLayout.vue'),
    children: [
      {
        name: 'home',
        path: '',
        component: () => import('pages/Home.vue'),
        meta: { auth: true, redirect: { name: 'index' } }
      },
      {
        name: 'userProfile',
        path: '/profile/:username',
        component: () => import('pages/UserProfile.vue'),
        meta: { auth: true }
      },
      {
        path: 'profile',
        redirect: '/'
      },
      {
        name: 'newGroup',
        path: '/groups/new',
        component: () => import('pages/AddGroup.vue'),
        meta: { auth: true }
      },
      {
        path: 'groups',
        redirect: '/'
      }
    ]
  },
  {
    path: '/login',
    component: () => import('layouts/LoginLayout.vue'),
    children: [
      { name: 'login', path: '/login', props: true, component: () => import('pages/Login.vue') }
    ],
    meta: { auth: false, redirect: { name: 'home' } }
  },
  {
    path: '/register',
    component: () => import('layouts/LoginLayout.vue'),
    children: [
      {
        name: 'register',
        path: '/register',
        props: true,
        component: () => import('pages/Register.vue')
      }
    ],
    meta: { auth: false, redirect: { name: 'home' } }
  },
  {
    path: '/',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      { name: 'index', path: '', component: () => import('pages/Index.vue') },
      {
        name: 'landing',
        path: '/landing',
        props: { redirectOnLoggedIn: false },
        component: () => import('pages/Index.vue')
      }
    ]
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
