import {
  FormRuntime,
  type CorePlugin,
  type CorePluginContext,
  type CorePluginError,
} from '../index';

interface Values {
  name: string;
}

const plugin: CorePlugin<Values> = {
  name: 'typed-plugin',
  setup(context: CorePluginContext<Values>) {
    const name: string = context.getState().values.name;
    void name;
  },
  interceptMutation(mutation) {
    if (mutation.type !== 'setValue') return;
    return { ...mutation, value: String(mutation.value).trim() };
  },
};

const runtime = new FormRuntime(
  { id: 'plugin-types', fields: [{ name: 'name', type: 'text' }] },
  { name: '' },
  {
    plugins: [plugin],
    onPluginError(error: CorePluginError) {
      const pluginName: string = error.plugin;
      void pluginName;
    },
  },
);
runtime.setValue('name', 'Ada');
runtime.dispose();
