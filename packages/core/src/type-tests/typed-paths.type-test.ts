import { dynamicPath, FormStore, getByPath, setByPath } from '../index';
import type { Path, PathValue } from '../index';

type Equal<TLeft, TRight> =
  (<T>() => T extends TLeft ? 1 : 2) extends (<T>() => T extends TRight ? 1 : 2)
    ? true
    : false;
type Expect<T extends true> = T;
type Includes<TUnion, TMember> = TMember extends TUnion ? true : false;

interface CustomerValues {
  name: string;
  age: number;
  address: { city: string; postcode?: string };
  contacts: Array<{ name: string; phones: string[] }>;
}

type CustomerPath = Path<CustomerValues>;
type _RootPath = Expect<Includes<CustomerPath, 'name'>>;
type _NestedPath = Expect<Includes<CustomerPath, 'address.city'>>;
type _ArrayDotPath = Expect<Includes<CustomerPath, 'contacts.0.name'>>;
type _ArrayBracketPath = Expect<Includes<CustomerPath, 'contacts[0].phones[1]'>>;
type _RejectUnknownPath = Expect<Equal<Includes<CustomerPath, 'address.country'>, false>>;
type _NestedValue = Expect<Equal<PathValue<CustomerValues, 'address.city'>, string>>;
type _OptionalValue = Expect<Equal<PathValue<CustomerValues, 'address.postcode'>, string | undefined>>;
type _ArrayValue = Expect<Equal<PathValue<CustomerValues, 'contacts[0].phones.0'>, string>>;

const values: CustomerValues = {
  name: 'Ada', age: 36, address: { city: 'London' },
  contacts: [{ name: 'Charles', phones: ['123'] }],
};
const city = getByPath(values, 'address.city');
type _InferredGetterValue = Expect<Equal<typeof city, string>>;
const updated = setByPath(values, 'contacts[0].name', 'Grace');
type _ImmutableSetterResult = Expect<Equal<typeof updated, CustomerValues>>;

const store = new FormStore<CustomerValues>(values);
const storedCity = store.getValue('address.city');
type _InferredStoreValue = Expect<Equal<typeof storedCity, string>>;
store.setValue('age', 37);
store.setValue('contacts[0].phones[0]', '456');
store.setError('address.city', 'Required');
store.resetField('contacts.0.name');
// @ts-expect-error incorrect value for the selected path
store.setValue('age', '37');
// @ts-expect-error unknown statically typed path
store.setValue('address.country', 'UK');
// @ts-expect-error unknown error path
store.setError('missing', 'Invalid');

const runtimePath = dynamicPath(String(Math.random()));
store.setValue(runtimePath, { runtime: true });
const runtimeValue = store.getValue(runtimePath);
type _DynamicValueIsUnknown = Expect<Equal<typeof runtimeValue, unknown>>;

const dynamicStore = new FormStore<Record<string, unknown>>();
dynamicStore.setValue('arbitrary.deep.path', 42);