import * as Sentry from '@sentry/browser';
import { Vue as VueIntegration } from '@sentry/integrations';
import { onAuthUser } from '@/services/auth';
import { i18n } from '@/boot/i18n';

const ENABLED = process.env.PROD;

function capture(e, level = Sentry.Severity.Error) {
  if (e) {
    if (typeof e === 'string') {
      Sentry.captureMessage(e, level);
    } else {
      Sentry.captureException(e, level);
    }
  }
}

function log(e, level = Sentry.Severity.Error) {
  if (e) {
    console.error(`[${level}]`, e);
  }
}

export const report = ENABLED ? capture : log;

const handled = new Set();

function reportUnique(key, message, level) {
  if (!handled.has(key)) {
    report(message, level);
    handled.add(key);
  }
}

// GraphQL messages are handled in onError global handler
// Overriding info messages are handled in components apollo handler
// So we delay reporting global errors to allow overriding
export function reportCode(code, message, delayed = true) {
  const doReport = () => reportUnique(message, `[${code}] ${message}`);
  if (delayed) {
    setTimeout(doReport, 1000);
  } else {
    doReport();
  }
}

export function info(message, handle) {
  reportUnique(handle, message, Sentry.Severity.Info);
}

function withScopeContext(context, callback) {
  Sentry.withScope(scope => {
    scope.setExtras(context);
    callback();
  });
}

function withContextDev(_context, callback) {
  callback();
}

export const withContext = ENABLED ? withScopeContext : withContextDev;

export default async ({ Vue }) => {
  if (ENABLED) {
    Sentry.init({
      dsn: 'https://ef7914b19b7646aaa533ccb64b0d395a@o397811.ingest.sentry.io/5252701',
      integrations: [new VueIntegration({ Vue, attachProps: true })]
    });

    onAuthUser(user => {
      Sentry.configureScope(scope => {
        if (user) {
          const userScope = {
            id: user.id,
            username: user.username
          };
          scope.setUser(userScope);
        }
        scope.setTag('locale', i18n.locale);
      });
    });
  }

  Vue.prototype.$report = report;
  Vue.prototype.$info = info;
};
