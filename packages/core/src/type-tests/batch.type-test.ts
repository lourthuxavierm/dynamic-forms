import { FormStore } from '../index';

const store = new FormStore({ count: 0, label: '' });
const syncResult: number = store.batch(() => {
  store.setValue('count', 1);
  store.setValue('label', 'one');
  return 1;
});
const asyncResult: Promise<string> = store.batch(async () => {
  store.setValue('count', 2);
  await Promise.resolve();
  return 'complete';
});
void syncResult;
void asyncResult;
// @ts-expect-error batch mutations keep typed-path value safety
store.batch(() => store.setValue('count', 'invalid'));