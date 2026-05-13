import { startBoredClassSleeper } from '@/features/bored-class-sleeper';

export default defineContentScript({
  matches: ['*://*.coursera.org/*'],
  runAt: 'document_idle',
  main() {
    void startBoredClassSleeper();
  },
});
