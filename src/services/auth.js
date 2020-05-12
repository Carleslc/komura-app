import { LocalStorage } from 'quasar';
import { asUsername } from '@/utils/strings';

const LAST_LOGIN = 'LAST_LOGIN';
const REFRESH_TOKEN_ENDPOINT = 'https://europe-west1-komura-app.cloudfunctions.net/refreshToken';

const CURRENT_USER_QUERY = require('@/graphql/client/getCurrentUser.gql');

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
    return this.firebaseAuth.currentUser;
  }

  get header() {
    return this.token ? `Bearer ${this.token}` : undefined;
  }

  get user() {
    return this.app.apolloClient.readQuery({ query: CURRENT_USER_QUERY }).user;
  }

  isLoggedIn() {
    return !!this.firebaseUser || LocalStorage.has(LAST_LOGIN);
  }

  logout() {
    this.app.apolloClient.clearStore().then(() => {
      LocalStorage.remove('apollo-cache-persist');
      this.firebaseAuth.signOut();
    });
  }

  setCurrentUser(firebaseUser) {
    const currentUser = this.app.apolloClient.readQuery({ query: CURRENT_USER_QUERY });
    if (!currentUser || currentUser.id !== firebaseUser.uid) {
      const name = this.additionalUserInfo.profile.given_name || firebaseUser.displayName;
      const username = this.additionalUserInfo.username || asUsername(firebaseUser.displayName);
      this.app.apolloClient.writeQuery({
        query: CURRENT_USER_QUERY,
        data: {
          user: {
            __typename: 'User',
            id: firebaseUser.uid,
            created_at: firebaseUser.metadata.creationTime,
            username,
            name,
            description: null,
            image: null,
            banner: null
          }
        }
      });
    }
  }

  socialSignInSuccess(authResult, redirectUrl) {
    this.additionalUserInfo = authResult.additionalUserInfo;
    this.setCurrentUser(authResult.user);
    this.router.push(redirectUrl || { name: 'home' });
    this.redirectOnLoggedIn = undefined;
    return false; // redirect already handled
  }

  // eslint-disable-next-line class-methods-use-this
  registerUser(id, email, name, username) {
    // TODO: Create hasura user (this.app.apolloClient)
    console.log('Create hasura user');
  }

  // eslint-disable-next-line class-methods-use-this
  updateLastLogin(id) {
    // TODO: Update hasura last_login
    console.log('Update hasura last_login');
  }

  load() {
    function loginUser(firebaseUser, validToken) {
      this.token = validToken;
      const lastLogin = firebaseUser.metadata.lastSignInTime;
      if (LocalStorage.getItem(LAST_LOGIN) !== lastLogin) {
        // new login
        LocalStorage.set(LAST_LOGIN, lastLogin);
        if (this.additionalUserInfo.isNewUser) {
          const { name, username } = this.user;
          this.registerUser(firebaseUser.uid, firebaseUser.email, name, username);
        } else {
          this.updateLastLogin(firebaseUser.uid);
        }
      }
      if (this.redirectOnLoggedIn) {
        this.router.ensure(this.redirectOnLoggedIn);
      }
    }

    function logoutUser() {
      this.token = undefined;
      LocalStorage.remove(LAST_LOGIN);
      if (this.router.currentRoute.meta.auth) {
        this.router.ensure({ name: 'index' });
      }
    }

    return new Promise(resolve => {
      this.firebaseAuth.onAuthStateChanged(firebaseUser => {
        resolve();
        if (firebaseUser) {
          // User is logged in
          this.setCurrentUser(firebaseUser);
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
