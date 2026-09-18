import {
  FormRuntime,
  createFormRuntime,
  defineFormSchema,
  RUNTIME_LIFECYCLE_PHASES,
  type RuntimeLifecycleEvent,
} from '../index';

interface Values {
  country: string;
  state: string | null;
}

const runtime = new FormRuntime<Values>(
  {
    id: 'typed-runtime',
    fields: [
      { name: 'country', type: 'select' },
      { name: 'state', type: 'select', dependsOn: ['country'] },
    ],
  },
  { country: 'IN', state: null },
);

runtime.setValue('country', 'US');
runtime.setValue('state', null);
// @ts-expect-error state does not accept a number
runtime.setValue('state', 1);

runtime.onLifecycle((event: RuntimeLifecycleEvent<Values>) => {
  const phase = event.phase;
  void phase;
});
void RUNTIME_LIFECYCLE_PHASES;
runtime.dispose();

const inferredSchema = defineFormSchema({ schemaVersion: 1, id: 'inferred-runtime', fields: [
  { name: 'profile', type: 'object', fields: [{ name: 'name', type: 'text' }] },
  { name: 'contacts', type: 'array', fields: [{ name: 'email', type: 'email' }] },
] } as const);
const inferredRuntime = createFormRuntime(inferredSchema, {
  profile: { name: 'Ada' },
  contacts: [{ email: 'ada@example.com' }],
});
inferredRuntime.setValue('profile.name', 'Grace');
inferredRuntime.setValue('contacts.0.email', 'grace@example.com');
// @ts-expect-error inferred nested value is a string
inferredRuntime.setValue('profile.name', 42);
// @ts-expect-error inferred initial values reject the wrong nested shape
createFormRuntime(inferredSchema, { profile: { name: 42 }, contacts: [] });
inferredRuntime.dispose();
