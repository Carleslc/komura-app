import axios from 'axios';
import { LocalStorage } from 'quasar';
import { DateTime } from 'luxon';
import { asUsername } from '@/utils/strings';
import { hoursElapsed } from '@/utils/dates';

const USER_KEY = 'current-user';
const REFRESH_TOKEN_ENDPOINT = 'https://europe-west1-komura-app.cloudfunctions.net/refreshToken';

const CURRENT_USER_QUERY = require('@/graphql/client/getCurrentUser.gql');

const Providers = {
  GOOGLE: 'google.com'
};

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
    this.onAuthHeader = [];
    this.load();
  }

  onApolloReady(apolloClient) {
    this.apollo = apolloClient;
    this.updateCurrentUser(LocalStorage.getItem(USER_KEY), false);
  }

  get firebaseUser() {
    return this.firebaseAuth.currentUser;
  }

  get user() {
    const userData = this.apollo.readQuery({ query: CURRENT_USER_QUERY });
    return userData ? userData.currentUser : undefined;
  }

  get provider() {
    return this.firebaseAuth.currentUser.providerData[0].providerId;
  }

  /**
   * Authorize calls to provider API
   * @param {String} accessToken Provider OAuth2 Token
   */
  static set providerToken(accessToken) {
    axios.defaults.headers.common.Authorization = accessToken ? `Bearer ${accessToken}` : undefined;
  }

  /**
   * @param {String} token Firebase Id Token
   */
  updateHeader(token) {
    this.header = token ? `Bearer ${token}` : null;

    if (this.onAuthHeader.length > 0) {
      this.onAuthHeader.forEach(callback => callback(this.header));
      this.onAuthHeader = [];
    }

    return this.header;
  }

  fetchAuthHeader() {
    return new Promise(resolve => {
      if (this.header !== undefined) {
        if (this.firebaseUser) {
          this.firebaseUser
            .getIdToken() // retrieve or refresh if expired
            .then(token => resolve(this.updateHeader(token)));
        } else {
          resolve(this.header);
        }
      } else {
        this.onAuthHeader.push(resolve);
      }
    });
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
          currentUser: {
            __typename: 'User',
            description: null,
            image: null,
            banner: null,
            ...this.user,
            ...user
          }
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
      this.updateCurrentUser({
        id: firebaseUser.uid,
        username: this.additionalUserInfo.username || asUsername(firebaseUser.displayName),
        name: firebaseUser.displayName,
        given_name: this.additionalUserInfo.profile.given_name || null,
        provider_picture: this.additionalUserInfo.profile.picture || null,
        gender: this.additionalUserInfo.profile.gender || null,
        created_at: null,
        last_login: null
      });
    }
  }

  socialSignInSuccess(authResult, redirectUrl) {
    this.additionalUserInfo = authResult.additionalUserInfo;
    this.providerToken = authResult.credential.accessToken;
    this.setCurrentUser(authResult.user);
    this.router.push(redirectUrl || { name: 'home' });
    this.redirectOnLoggedIn = undefined;
    return false; // redirect already handled
  }

  loadGender() {
    return new Promise(resolve => {
      switch (this.provider) {
        case Providers.GOOGLE:
          axios
            .get('https://people.googleapis.com/v1/people/me?personFields=genders')
            .then(({ data }) => {
              // https://developers.google.com/people/api/rest/v1/people#gender
              let gender = data.genders[0];
              gender = gender.addressMeAs || gender.value;
              if (gender === 'male') {
                this.updateCurrentUser({ gender: 'm' });
              } else if (gender === 'female') {
                this.updateCurrentUser({ gender: 'f' });
              }
              // gender 'other' or 'unspecified' does not set gender (null)
            })
            .catch(e => {
              console.error(e);
            })
            .finally(resolve);
          break;
        default:
          resolve();
      }
    });
  }

  registerUser(firebaseUser) {
    // console.log('Create hasura user');
    this.loadGender().then(() => {
      const { name, username, gender } = this.user;
      this.apollo
        .mutate({
          mutation: require('@/graphql/createUser.gql'),
          variables: {
            id: firebaseUser.uid,
            email: firebaseUser.email,
            name,
            username,
            givenName: this.additionalUserInfo.profile.given_name,
            providerPicture: this.additionalUserInfo.profile.picture,
            gender
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
        })
        .catch(console.error);
    });
  }

  updateLastLogin(firebaseUser) {
    // console.log('Update hasura last_login');
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
            given_name: user.given_name,
            username: user.personal_space.username,
            name: user.main_profile.name,
            description: user.main_profile.description,
            image: user.main_profile.image,
            banner: user.main_profile.banner,
            provider_picture: user.provider_picture,
            gender: user.gender,
            created_at: user.created_at,
            last_login: user.last_login
          });
        } else {
          this.registerUser(firebaseUser);
        }
      });
  }

  load() {
    function onLoggedIn(firebaseUser, validToken) {
      this.updateHeader(validToken);
      const lastLogin = this.user.last_login;
      if (!lastLogin || hoursElapsed(DateTime.fromISO(lastLogin)) >= 1) {
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

    function onLoggedOut() {
      this.updateHeader(undefined);
      LocalStorage.clear();

      if (this.router.currentRoute.matched.some(r => r.meta.auth)) {
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
              onLoggedIn.call(this, firebaseUser, validToken);
            })
            .catch(e => {
              console.error(e);
              onLoggedOut.call(this);
            });
        } else {
          // User is logged out
          onLoggedOut.call(this);
        }
      });
    });
  }
}
