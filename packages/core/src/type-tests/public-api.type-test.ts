import type {
  FieldDefinition,
  FieldValue,
  FieldValueMap,
  FormEvent,
  InferSchemaType,
  Validator,
} from '../index';
import { FieldRegistry } from '../index';

type Equal<TLeft, TRight> =
  (<T>() => T extends TLeft ? 1 : 2) extends (<T>() => T extends TRight ? 1 : 2)
    ? true
    : false;
type Expect<T extends true> = T;

type _TextValue = Expect<Equal<FieldValue<'text'>, string>>;
type _NumberValue = Expect<Equal<FieldValue<'number'>, number | null>>;
type _MultiValue = Expect<Equal<FieldValue<'multi-select'>, Array<string | number | boolean>>>;
type _CustomValue = Expect<Equal<FieldValue<'color', { color: `#${string}` }>, `#${string}`>>;
type _UnknownCustomValue = Expect<Equal<FieldValue<'unregistered'>, unknown>>;
type _MapIsPublic = Expect<Equal<FieldValueMap['checkbox'], boolean>>;

const customerSchema = {
  id: 'customer',
  fields: [
    { name: 'name', type: 'text' },
    { name: 'age', type: 'number' },
    { name: 'marketing', type: 'checkbox' },
    { name: 'tags', type: 'multi-select' },
    { name: 'address', type: 'object', fields: [{ name: 'city', type: 'text' }] },
  ],
} as const;

type CustomerValues = InferSchemaType<typeof customerSchema>;
type _Name = Expect<Equal<CustomerValues['name'], string>>;
type _Age = Expect<Equal<CustomerValues['age'], number | null>>;
type _Marketing = Expect<Equal<CustomerValues['marketing'], boolean>>;
type _Tags = Expect<Equal<CustomerValues['tags'], Array<string | number | boolean>>>;
type _City = Expect<Equal<CustomerValues['address']['city'], string>>;

interface Renderer { render(): void }
interface Metadata extends Record<string, unknown> { category: 'input' | 'display' }
type CustomFieldType = 'text' | 'color';
const registry = new FieldRegistry<Renderer, Metadata, CustomFieldType>();
registry.register({ type: 'color', component: { render() {} }, metadata: { category: 'input' } });
const definition: FieldDefinition<Renderer, Metadata, CustomFieldType> = registry.get('color')!;
definition.component.render();
// @ts-expect-error unregistered field type
registry.get('date');
// @ts-expect-error metadata category is constrained
registry.register({ type: 'text', component: { render() {} }, metadata: { category: 'other' } });

const validator: Validator<number, { minimum: number }> = (value, values) =>
  value >= values.minimum ? undefined : { code: 'minimum', message: 'Too small' };
void validator;
// @ts-expect-error validator value type is numeric
const invalidValidator: Validator<number> = (value: string) => value;
void invalidValidator;

const event: FormEvent<string, { name: string }> = {
  type: 'valueChange',
  field: 'name',
  value: 'Ada',
  payload: { values: { name: 'Ada' } },
};
void event;
// @ts-expect-error event value type is string
const invalidEvent: FormEvent<string> = { type: 'valueChange', value: 42 };
void invalidEvent;