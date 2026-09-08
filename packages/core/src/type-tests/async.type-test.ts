import {
  AsyncRequestManager,
  DataSourceManager,
  FormStore,
  type AsyncRequestContext,
  type FormValidator,
} from '../index';

const requests = new AsyncRequestManager<'search'>();
const result: Promise<{ requestId: number; value: string[]; current: boolean }> = requests.run(
  'search',
  async ({ signal }) => {
    signal.throwIfAborted();
    return ['result'];
  },
);
void result;

const validator: FormValidator<{ email: string }> = async (values, context) => {
  context?.signal.throwIfAborted();
  return values.email ? {} as Record<string, string> : { email: 'Required' };
};
const store = new FormStore({ email: '' });
void store.validate(validator, { signal: new AbortController().signal });
store.cancelValidation();

const sources = new DataSourceManager();
void sources.loadConfig(
  'users',
  { type: 'function', load: (context) => {
    const request: Partial<AsyncRequestContext> = context;
    return request.signal?.aborted ? [] : ['Ada'];
  } },
  { values: {} },
);
