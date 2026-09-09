import { FormStore } from '../index';
import type { EqualityFn, FormSelector, SelectorListener } from '../index';

interface Values {
  customer: { name: string };
  count: number;
}

const store = new FormStore<Values>({ customer: { name: 'Ada' }, count: 0 });
const selectName: FormSelector<Values, string> = (state) => state.values.customer.name;
const nameListener: SelectorListener<string> = (name, previousName) => {
  const current: string = name;
  const previous: string = previousName;
  void current;
  void previous;
};
const caseInsensitive: EqualityFn<string> = (left, right) => left.toLowerCase() === right.toLowerCase();
store.subscribeSelector(selectName, nameListener, caseInsensitive);
store.subscribeToValue('count', (count, previousCount) => {
  const current: number = count;
  const previous: number = previousCount;
  void current;
  void previous;
});
// @ts-expect-error value subscription path must exist
store.subscribeToValue('missing', () => undefined);
// @ts-expect-error selector listener receives the selected string type
store.subscribeSelector(selectName, (selected: number) => selected);