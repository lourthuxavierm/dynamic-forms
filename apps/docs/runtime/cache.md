# Data-source cache

- Status: Documented
- Owner: Core maintainers
- Last verified: 2026-08-26
- Applies to: `DataSourceManager` 0.1.0

Caching is opt-in through `DataSourceConfig.cache`.

## Default key

Without `cacheKey`, the manager builds a key from:

- source name;
- complete current values;
- search;
- page;
- page size.

This uses `JSON.stringify`. Values must therefore be serializable and stable
enough for a cache key. Large or sensitive value trees should use an explicit,
non-sensitive `cacheKey` and application-owned invalidation policy.

## Cache hit

A hit cancels the current named run, sets loading false, installs cached data,
and returns it. Cached arrays are held in memory; the manager does not provide
TTL, size bounds, persistence, or cross-instance sharing.

## Invalidation

- `clearCache()` clears every cached entry.
- `unregister(name)` clears the cache entry keyed exactly by the source name,
  but generated keys may differ; use `clearCache` when complete invalidation is
  required.
- `clear()` cancels sources and clears sources, cache, and states.

Do not use this cache for authorization decisions or durable business data.
