import { createApp } from 'vue';
import { createPinia } from 'pinia';
import './style.css';
import App from './App.vue';
import { useExtensionStore } from '@/stores/extension';
import { useSleeperStore } from '@/stores/sleeper';

async function bootstrap() {
  const pinia = createPinia();
  const app = createApp(App);
  app.use(pinia);
  try {
    await Promise.all([useExtensionStore().hydrate(), useSleeperStore().hydrate()]);
  } catch (err) {
    console.error('[Sleeper Jr Bot] Store hydrate failed', err);
  }
  app.mount('#app');
}

void bootstrap();
