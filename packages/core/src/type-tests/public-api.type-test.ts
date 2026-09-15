import type {
  FieldDefinition,
  FieldValue,
  FieldValueMap,
  FormEvent,
  InferSchemaType,
  Validator,
  StrictFormSchema,
} from '../index';
import { defineFormSchema, definePortableFormSchema, FieldRegistry } from '../index';

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

const strictSchema = defineFormSchema({ schemaVersion: 1, id: 'strict', fields: [
  { name: 'title', type: 'text', defaultValue: 'Draft', validation: { minLength: 2 } },
  { name: 'amount', type: 'number', defaultValue: 1, validation: { min: 0 } },
  { name: 'group', type: 'object', fields: [{ name: 'enabled', type: 'checkbox', defaultValue: false }] },
] } as const);
const strictContract: StrictFormSchema = strictSchema;
void strictContract;
// @ts-expect-error text defaults must be strings
defineFormSchema({ schemaVersion: 1, id: 'bad-default', fields: [{ name: 'title', type: 'text', defaultValue: 1 }] } as const);
// @ts-expect-error string validation does not accept numeric min
defineFormSchema({ schemaVersion: 1, id: 'bad-validation', fields: [{ name: 'title', type: 'text', validation: { min: 1 } }] } as const);
// @ts-expect-error value fields cannot contain structural children
defineFormSchema({ schemaVersion: 1, id: 'bad-children', fields: [{ name: 'title', type: 'text', fields: [{ name: 'nested', type: 'text' }] }] } as const);
// @ts-expect-error structural fields require children
defineFormSchema({ schemaVersion: 1, id: 'bad-object', fields: [{ name: 'group', type: 'object' }] } as const);
// @ts-expect-error persisted strict schemas must carry an explicit format version
defineFormSchema({ id: 'missing-version', fields: [{ name: 'title', type: 'text' }] } as const);

definePortableFormSchema({ schemaVersion: 1, id: 'portable', fields: [{ name: 'country', type: 'select', dataSource: { type: 'url', url: '/countries', params: { active: true } }, metadata: { audit: 'country' } }] } as const);
// @ts-expect-error portable schemas cannot contain function data sources
definePortableFormSchema({ schemaVersion: 1, id: 'runtime-only', fields: [{ name: 'country', type: 'select', dataSource: { type: 'function', load: async () => [] } }] } as const);
// @ts-expect-error portable metadata must be JSON-safe
definePortableFormSchema({ schemaVersion: 1, id: 'bad-metadata', fields: [{ name: 'title', type: 'text', metadata: { callback: () => undefined } }] } as const);
