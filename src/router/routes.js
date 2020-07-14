const routes = [
  // Redirects
  {
    path: '/groups',
    redirect: '/'
  },
  // Authenticated
  {
    path: '/',
    meta: { auth: true },
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
        path: '/profile/:username?',
        component: () => import('pages/UserProfile.vue'),
        props: true,
        meta: { auth: true, redirect: { name: 'publicUserProfile' } }
      },
      {
        name: 'newGroup',
        path: '/groups/new',
        component: () => import('pages/AddGroup.vue')
      },
      {
        name: 'editGroup',
        path: '/groups/:path*/edit',
        component: () => import('pages/EditGroup.vue'),
        props: true
      },
      {
        name: 'group',
        path: '/groups/:path*',
        component: () => import('pages/Group.vue'),
        props: true,
        meta: { auth: true, redirect: { name: 'publicGroup' } }
      }
    ]
  },
  // Public
  {
    path: '/',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      {
        name: 'index',
        path: '',
        component: () => import('pages/Index.vue')
      },
      {
        name: 'landing',
        path: '/landing',
        props: { redirectOnLoggedIn: false },
        component: () => import('pages/Index.vue')
      },
      {
        name: 'publicUserProfile',
        path: '/profile/:username',
        component: () => import('pages/UserProfile.vue'),
        props: true
      }
    ]
  },
  {
    path: '/',
    component: () => import('layouts/MainLayout.vue'),
    props: { branded: false },
    children: [
      {
        name: 'publicGroup',
        path: '/groups/:path*',
        component: () => import('pages/Group.vue'),
        props: true
      }
    ]
  },
  // Login / Register
  {
    path: '/login',
    component: () => import('layouts/LoginLayout.vue'),
    children: [{ name: 'login', path: '/login', component: () => import('pages/Login.vue') }],
    meta: { auth: false, redirect: { name: 'home' } }
  },
  {
    path: '/register',
    component: () => import('layouts/LoginLayout.vue'),
    children: [
      {
        name: 'register',
        path: '/register',
        component: () => import('pages/Register.vue')
      }
    ],
    meta: { auth: false, redirect: { name: 'home' } }
  }
];

// Always leave this as last one
if (process.env.MODE !== 'ssr') {
  routes.push({
    path: '*',
    component: () => import('layouts/MainLayout.vue'),
    children: [{ name: 'notFound', path: '', component: () => import('pages/NotFound.vue') }]
  });
}

export default routes;
