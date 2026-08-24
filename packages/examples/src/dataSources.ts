export type SourceType = 'static' | 'api';
export type Paging = 'offset' | 'page' | 'cursor';
export type Simulation = 'normal' | 'empty' | 'failure';
export type Freshness = 'fresh' | 'cached' | 'stale';
export interface RawOption { id: string; display_name: string; region: string; }
export interface NormalizedOption { label: string; value: string; }
export interface DataSourceQueryInput { country: string; search: string; paging: Paging; page: number; cursor: string; }

export const cityFixtures: readonly RawOption[] = [
  { id: 'blr', display_name: 'Bengaluru', region: 'IN' },
  { id: 'maa', display_name: 'Chennai', region: 'IN' },
  { id: 'sfo', display_name: 'San Francisco', region: 'US' },
  { id: 'nyc', display_name: 'New York City', region: 'US' },
];
export const normalizeCityOptions = (items: readonly RawOption[]): NormalizedOption[] => items.map((item) => ({ label: item.display_name, value: item.id }));
export const filterCityFixtures = (country: string, search = ''): RawOption[] => cityFixtures.filter((item) => item.region === country && item.display_name.toLowerCase().includes(search.toLowerCase()));
export const buildDataSourceQuery = ({ country, search, paging, page, cursor }: DataSourceQueryInput): Record<string, string | number> => ({ country, q: search, ...(paging === 'offset' ? { offset: (page - 1) * 10, limit: 10 } : paging === 'page' ? { page, pageSize: 10 } : { cursor, limit: 10 }) });
export const createDataSourceCacheKey = (input: DataSourceQueryInput & { source: SourceType; simulation: Simulation }): string => [input.source, input.country, input.search, input.paging, input.page, input.cursor, input.simulation].join(':');
