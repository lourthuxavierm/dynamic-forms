# Native date and time contracts

## Stored values

- Date-only fields store YYYY-MM-DD.
- Time fields store HH:mm or HH:mm:ss.
- Local datetime fields store YYYY-MM-DDTHH:mm or YYYY-MM-DDTHH:mm:ss.
- Range fields store a two-item tuple using the corresponding scalar format.
- Empty endpoints store undefined.

These strings intentionally contain no timezone. Date-only values never pass
through Date.toISOString(), avoiding accidental previous/next-day conversion.
Local datetime normalization rejects values with Z or an explicit UTC offset.

Use parseLocalDateTime only when a JavaScript Date is required. It constructs
the Date from local calendar components. Converting that Date to UTC is an
application-level decision.

## Native picker differences

Picker appearance and interaction are controlled by the browser and operating
system. Chromium, Firefox, and WebKit may differ in calendar affordances,
seconds visibility, keyboard shortcuts, and locale presentation. The submitted
value format remains the normalized contract above.

Applications must not depend on the visual picker being present. Manual input,
native constraint validation affordances, and the adapter validation pipeline
remain available.

## Constraints and ranges

The adapter maps min, max, minDate, maxDate, and step configuration to native
attributes. Range endpoints constrain one another. If an endpoint crosses the
other endpoint, the range collapses to the newly selected value rather than
storing an inverted interval.

## Progressive enhancement

createHtmlTemporalField accepts an enhancer that receives the normalized native
input properties and headless field props. Consumers can render a custom picker
without changing form storage, validation, or schema contracts. A custom
registry override installs the enhanced component per form.
