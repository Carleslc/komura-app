import { LocalStorage } from 'quasar';

const TOKEN_KEY = 'ACCESS_TOKEN';

export const AuthService = {
  getAuth() {
    const token = LocalStorage.getItem(TOKEN_KEY);
    return token ? `Bearer ${token}` : undefined;
  }
};
