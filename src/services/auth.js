import { LocalStorage } from 'quasar';
import { firebaseAuth } from '@/boot/firebase';

const TOKEN_KEY = 'ACCESS_TOKEN';
const USER_KEY = 'CACHE_USER';
const REFRESH_TOKEN_ENDPOINT = 'https://europe-west1-komura-app.cloudfunctions.net/refreshToken';

export const AuthService = {
  isLoggedIn() {
    return !!AuthService.getFirebaseUser();
  },
  getAuth() {
    const token = LocalStorage.getItem(TOKEN_KEY);
    return token ? `Bearer ${token}` : undefined;
  },
  getFirebaseUser() {
    return firebaseAuth.currentUser || LocalStorage.getItem(USER_KEY);
  },
  logout() {
    firebaseAuth.signOut();
    // TODO: Set hasura user last_exit to now
    LocalStorage.remove(USER_KEY);
    LocalStorage.remove(TOKEN_KEY);
  },
  requireAuth(record) {
    return 'meta' in record && record.meta.auth && !AuthService.isLoggedIn();
  },
  ensureUnauthenticatedRoute(router) {
    if (AuthService.requireAuth(router.currentRoute)) {
      router.ensure({ name: 'index' });
    }
  },
  load(router) {
    return new Promise(resolve => {
      firebaseAuth.onAuthStateChanged(firebaseUser => {
        resolve();
        if (firebaseUser) {
          // User is logged in
          // Cache some fields to load authenticated pages faster in the future
          LocalStorage.set(USER_KEY, { displayName: firebaseUser.displayName });
          firebaseUser
            .getIdToken() // retrieve or refresh if expired
            .then(token =>
              firebaseUser.getIdTokenResult().then(result => {
                if (result.claims['https://hasura.io/jwt/claims']) {
                  return token;
                }
                return fetch(`${REFRESH_TOKEN_ENDPOINT}?uid=${firebaseUser.uid}`).then(res => {
                  if (res.status === 200) {
                    return firebaseUser.getIdToken(true); // force refresh
                  }
                  return res.json().then(e => {
                    throw e;
                  });
                });
              })
            )
            .then(validToken => {
              LocalStorage.set(TOKEN_KEY, validToken);
              // TODO: Set hasura user last_login to now and retrieve fields
            })
            .catch(console.error);
        } else {
          // User is logged out
          AuthService.ensureUnauthenticatedRoute(router);
        }
      });
    });
  }
};
