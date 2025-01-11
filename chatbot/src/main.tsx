import { render } from 'preact';
import { App } from './app.tsx';
import './css/layers.css';
import './css/reset.css';
import './css/main.css';

export function aladdinGenerateAiClient() {
  if (import.meta.env.PROD) {
    const node = document.getElementsByTagName('body')[0];
    const id = 'target_attach_shadow';
    const rootElm = document.createElement('div');
    rootElm.id = id;
    node.append(rootElm);

    const shadowRoot = rootElm.attachShadow({ mode: 'open' });

    const styleElm = document.getElementById('cssInjectedByJsPlugin');
    if (styleElm) {
      shadowRoot.appendChild(styleElm.cloneNode(true));
      styleElm.remove();
    }

    const appId = 'spr-aladdin_generate_client';
    const appRootElm = document.createElement('div');
    appRootElm.id = appId;
    shadowRoot.appendChild(appRootElm);

    render(<App />, appRootElm);
  } else {
    const id = 'spr-aladdin_generate_client';
    const rootElm = document.createElement('div');
    rootElm.id = id;
    const node = document.getElementsByTagName('body')[0];
    node.append(rootElm);

    render(<App />, rootElm);
  }
}
