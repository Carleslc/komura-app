import { LocalStorage } from 'quasar';
import { asUsername } from '@/utils/strings';

const USER_KEY = 'CACHE_USER';
const LAST_LOGIN = 'LAST_LOGIN';
const REFRESH_TOKEN_ENDPOINT = 'https://europe-west1-komura-app.cloudfunctions.net/refreshToken';

export default class AuthService {
  static instance;

  constructor(app, firebaseAuth, router) {
    AuthService.instance = this;
    this.app = app;
    this.firebaseAuth = firebaseAuth;
    this.router = router;
    this.additionalUserInfo = {
      isNewUser: false,
      profile: {}
    };
    this.load();
  }

  get firebaseUser() {
    return LocalStorage.getItem(USER_KEY) || this.firebaseAuth.currentUser;
  }

  get header() {
    return this.token ? `Bearer ${this.token}` : undefined;
  }

  isLoggedIn() {
    return !!this.firebaseUser;
  }

  logout() {
    this.firebaseAuth.signOut();
  }

  // Cache some fields to load authenticated pages faster avoiding redirects
  cacheUser(firebaseUser) {
    if (!LocalStorage.has(USER_KEY)) {
      LocalStorage.set(USER_KEY, {
        displayName: this.additionalUserInfo.profile.given_name || firebaseUser.displayName
      });
    }
  }

  socialSignInSuccess(authResult, redirectUrl) {
    this.additionalUserInfo = authResult.additionalUserInfo;
    this.cacheUser(authResult.user);
    this.router.push(redirectUrl || { name: 'home' });
    this.redirectOnLoggedIn = undefined;
    return false; // redirect already handled
  }

  static registerUser(id, email, name, username) {
    // TODO: Create hasura user (app.apollo)
  }

  static updateLastLogin(id) {
    // TODO: Update hasura last_login
  }

  load() {
    function loginUser(firebaseUser, validToken) {
      this.token = validToken;
      const lastLogin = firebaseUser.metadata.lastSignInTime;
      if (LocalStorage.getItem(LAST_LOGIN) !== lastLogin) {
        LocalStorage.set(LAST_LOGIN, lastLogin);
        if (this.additionalUserInfo.isNewUser) {
          const name = this.additionalUserInfo.profile.given_name || firebaseUser.displayName;
          const username = this.additionalUserInfo.username || asUsername(firebaseUser.displayName);
          AuthService.registerUser(firebaseUser.uid, firebaseUser.email, name, username);
          console.log('Create hasura user');
        } else {
          AuthService.updateLastLogin(firebaseUser.uid);
          console.log('Update hasura last_login');
        }
      }
      if (this.redirectOnLoggedIn) {
        this.router.ensure(this.redirectOnLoggedIn);
      }
    }

    function logoutUser() {
      LocalStorage.remove(USER_KEY);
      this.token = undefined;
      if (this.router.currentRoute.meta.auth) {
        this.router.ensure({ name: 'index' });
      }
    }

    return new Promise(resolve => {
      this.firebaseAuth.onAuthStateChanged(firebaseUser => {
        resolve();
        if (firebaseUser) {
          // User is logged in
          this.cacheUser(firebaseUser);
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
              loginUser.call(this, firebaseUser, validToken);
            })
            .catch(e => {
              console.error(e);
              logoutUser.call(this);
            });
        } else {
          // User is logged out
          logoutUser.call(this);
        }
      });
    });
  }
}
