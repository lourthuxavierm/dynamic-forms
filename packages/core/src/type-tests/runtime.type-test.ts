import {
  FormRuntime,
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
