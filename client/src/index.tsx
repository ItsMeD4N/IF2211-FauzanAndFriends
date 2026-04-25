import 'react-app-polyfill/ie11';
import 'react-app-polyfill/stable';

import * as React from 'react';
import ReactDOM from 'react-dom/client';
import { Provider } from 'react-redux';
import FontFaceObserver from 'fontfaceobserver';

import 'sanitize.css/sanitize.css';

import { App } from 'app';

import { HelmetProvider } from 'react-helmet-async';

import { configureAppStore } from 'store/configureStore';

import { ThemeProvider } from 'styles/theme/ThemeProvider';

import reportWebVitals from 'reportWebVitals';

import './locales/i18n';

const openSansObserver = new FontFaceObserver('Inter', {});

openSansObserver.load().then(() => {
  document.body.classList.add('fontLoaded');
});

const store = configureAppStore();
const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement,
);

root.render(
  <Provider store={store}>
    <ThemeProvider>
      <HelmetProvider>
        <React.StrictMode>
          <App />
        </React.StrictMode>
      </HelmetProvider>
    </ThemeProvider>
  </Provider>,
);

if (module.hot) {
  module.hot.accept(['./locales/i18n'], () => {});
}

reportWebVitals();
