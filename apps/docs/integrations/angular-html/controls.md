# Angular HTML controls

- Status: Experimental 15-type baseline
- Owner: Angular HTML maintainers
- Last verified: 2026-08-27
- Applies to: `ANGULAR_HTML_BASELINE_FIELD_TYPES`

The frozen baseline contains:

`text`, `textarea`, `email`, `password`, `url`, `number`, `integer`, `decimal`,
`checkbox`, `select`, `radio`, `date`, `time`, `datetime`, and `hidden`.

Radio currently falls through to the generic input path and therefore requires
additional renderer work before it should be used as a multi-option group.
Object, array, files/media, composite selection, ranges, layouts, and the rest
of React HTML's v1 inventory are not advertised for Angular HTML 0.1.0.
