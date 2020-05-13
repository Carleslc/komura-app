import { LocalStorage } from 'quasar';
import { DateTime } from 'luxon';
import { asUsername } from '@/utils/strings';
import { hoursElapsed, toISO } from '@/utils/dates';

const USER_KEY = 'current-user';
const REFRESH_TOKEN_ENDPOINT = 'https://europe-west1-komura-app.cloudfunctions.net/refreshToken';

const CURRENT_USER_QUERY = require('@/graphql/client/getCurrentUser.gql');

export default class AuthService {
  static instance;

  constructor(firebaseAuth, router) {
    AuthService.instance = this;
    this.firebaseAuth = firebaseAuth;
    this.router = router;
    this.additionalUserInfo = {
      isNewUser: false,
      profile: {}
    };
    this.load();
  }

  onApolloReady(apolloClient) {
    this.apollo = apolloClient;
    this.updateCurrentUser(LocalStorage.getItem(USER_KEY), false);
  }

  get firebaseUser() {
    return this.firebaseAuth.currentUser;
  }

  get header() {
    return this.token ? `Bearer ${this.token}` : undefined;
  }

  get user() {
    const userData = this.apollo.readQuery({ query: CURRENT_USER_QUERY });
    return userData ? userData.user : undefined;
  }

  isLoggedIn() {
    return !!this.firebaseUser || !!this.user;
  }

  logout() {
    this.firebaseAuth.signOut();
    this.apollo.clearStore();
  }

  updateCurrentUser(user, persist = true) {
    if (user) {
      this.apollo.writeQuery({
        query: CURRENT_USER_QUERY,
        data: {
          user: { __typename: 'User', description: null, image: null, banner: null, ...this.user, ...user }
        }
      });
      if (persist) {
        LocalStorage.set(USER_KEY, { ...LocalStorage.getItem(USER_KEY), ...user });
      }
    }
  }

  setCurrentUser(firebaseUser) {
    const currentUser = this.user;
    if (!currentUser || currentUser.id !== firebaseUser.uid) {
      console.log('Set Current User');
      this.updateCurrentUser({
        id: firebaseUser.uid,
        username: this.additionalUserInfo.username || asUsername(firebaseUser.displayName),
        name: this.additionalUserInfo.profile.given_name || firebaseUser.displayName,
        created_at: toISO(firebaseUser.metadata.creationTime),
        last_login: toISO(firebaseUser.metadata.lastSignInTime)
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

  registerUser(firebaseUser) {
    console.log('Create hasura user');
    const { name, username } = this.user;
    this.apollo
      .mutate({
        mutation: require('@/graphql/createUser.gql'),
        variables: {
          id: firebaseUser.uid,
          email: firebaseUser.email,
          name,
          username
        }
      })
      .then(({ data }) => {
        const inserted = data.insert_users.returning[0];
        if (inserted) {
          this.updateCurrentUser({
            created_at: inserted.created_at,
            last_login: inserted.last_login
          });
        }
      });
  }

  updateLastLogin(firebaseUser) {
    console.log('Update hasura last_login');
    const lastLogin = DateTime.local().toISO();
    this.apollo
      .mutate({
        mutation: require('@/graphql/updateLastLogin.gql'),
        variables: {
          id: firebaseUser.uid,
          lastLogin
        }
      })
      .then(({ data }) => {
        const user = data.update_users.returning[0];
        if (user) {
          this.updateCurrentUser({
            id: user.id,
            username: user.personal_space.username,
            name: user.main_profile.name,
            description: user.main_profile.description,
            image: user.main_profile.image,
            banner: user.main_profile.banner,
            created_at: user.created_at,
            last_login: user.last_login
          });
        } else {
          this.registerUser(firebaseUser);
        }
      });
  }

  load() {
    function loginUser(firebaseUser, validToken) {
      this.token = validToken;
      const currentUser = this.user;
      if (!currentUser || hoursElapsed(DateTime.fromISO(currentUser.last_login)) >= 1) {
        if (this.additionalUserInfo.isNewUser) {
          this.registerUser(firebaseUser);
        } else {
          this.updateLastLogin(firebaseUser);
        }
      }
      if (this.redirectOnLoggedIn) {
        this.router.ensure(this.redirectOnLoggedIn);
      }
    }

    function logoutUser() {
      this.token = undefined;
      LocalStorage.remove(USER_KEY);
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
