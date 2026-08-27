# Localization, time zones, and regional formats

Separate stored values from displayed text. Keep translation keys in schemas
and resolve them through the application localization system; do not make
translated labels stable identifiers.

## Value policy

- Store dates as calendar dates (`YYYY-MM-DD`) without inventing a time zone.
- Store instants as ISO 8601 UTC values and retain the source zone separately
  when the business meaning depends on it.
- Store time-of-day with an explicit policy for zone and daylight-saving gaps.
- Parse localized numbers with a locale-aware control, then submit canonical
  numeric values. Never submit formatted currency strings as authoritative data.
- Keep currency, unit, locale, numbering system, and calendar explicit.

Test right-to-left layout, long translations, pluralization, non-Latin input,
decimal/group separators, DST transitions, and locale changes during a saved
draft. Server validation messages should use stable codes plus parameters so the
client can localize them safely.
