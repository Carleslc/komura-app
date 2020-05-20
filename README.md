# Komura

Kindly Network

### Setup Firebase config in .env file

```bash
API_KEY = 'AIza***'
AUTH_DOMAIN = '***.firebaseapp.com'
DATABASE_URL = 'https://***.firebaseio.com'
PROJECT_ID = '***'
STORAGE_BUCKET = '***.appspot.com'
MESSAGING_SENDER_ID = '***'
APP_ID = '***'
MEASUREMENT_ID = '***'
```

## Install the dependencies
```bash
yarn
```

### Start the app in development mode (hot-code reloading, error reporting, etc.)

```bash
nvm use default # node >= 10.18.1
quasar dev
```

### Lint the files
```bash
yarn run lint
```

### Build the app for production
```bash
quasar build
```

### Serve production app

```bash
quasar serve -o --history dist/spa
```

### Upgrade Quasar

```bash
quasar upgrade -i
```

### Customize the configuration

See [Configuring quasar.conf.js](https://quasar.dev/quasar-cli/quasar-conf-js).
