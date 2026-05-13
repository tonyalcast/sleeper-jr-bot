import { defineConfig } from 'wxt';

// See https://wxt.dev/api/config.html
export default defineConfig({
  modules: ['@wxt-dev/module-vue'],
  browser: 'edge',
  manifest: {
    name: 'Sleeper Jr Bot',
    description:
      'Coursera assistant (BoredClass Sleeper): floating panel, course videos, and AI help with your own API key.',
    action: {
      default_title: 'Sleeper Jr Bot',
    },
    // Required by wxt/utils.storage (Pinia hydrate) and browser.tabs.create from the popup/options.
    permissions: ['storage', 'tabs'],
    host_permissions: [
      'https://api.openai.com/*',
      'https://api.anthropic.com/*',
      'https://generativelanguage.googleapis.com/*',
      'https://api.deepseek.com/*',
    ],
  },
  runner: {
    binaries: {
      edge: '/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge',
    },
  },
});
