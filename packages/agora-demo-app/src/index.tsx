import ReactDOM from 'react-dom';
import './index.css';
import { RouteContainer } from './router';
import { StoreProvider } from './stores';
import { indexUrl, token } from './utils';
import { addResourceBundle } from 'agora-common-libs';
import { enUs } from './translate/enUs';
import en from './translate/en';
import { zhCn } from './translate/zhCn';
import zh from './translate/zh';
import { homeApi } from './api/home';
import { globalStore } from './stores/global';
import type { EduRegion } from 'agora-edu-core';

export const App: React.FC = () => {
  return (
    <StoreProvider>
      <RouteContainer />
    </StoreProvider>
  );
};

const renderByRegion = () => {
  Promise.all([
    addResourceBundle('en', enUs),
    addResourceBundle('zh', zhCn),
    addResourceBundle('en', en),
    addResourceBundle('zh', zh),
  ]).then(() => {
    ReactDOM.render(<App />, document.getElementById('root'));
  });
};

token.update(window.location.search);

if (
  window.location.hash === '' ||
  window.location.hash === '#/' ||
  window.location.hash.startsWith('#/invite')
) {
  const isInviteUrl = window.location.hash.startsWith('#/invite');
  const redirectUrl = isInviteUrl
    ? `${indexUrl}${window.location.hash}`
    : `${indexUrl}#/quick-start`;

  homeApi
    .preflight()
    .then(({ data }) => {
      // if no login required
      if (data.loginType === 0) {
        if (!globalStore.isRegionSet) {
          globalStore.setRegion('CN' as EduRegion);
        }
        // if current user has logged in before
        if (!token.accessToken) {
          // if user has not logged in
          window.location.replace(redirectUrl);
        }
      } else {
        if (!globalStore.isRegionSet) {
          globalStore.setRegion('NA' as EduRegion);
        }
      }
    })
    .finally(renderByRegion);
} else {
  renderByRegion();
}
