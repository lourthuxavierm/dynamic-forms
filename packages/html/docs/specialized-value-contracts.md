# Specialized control value contracts

## Currency

The stored value is a finite JavaScript number in the configured currency unit.
The control displays an Intl.NumberFormat currency string while unfocused and a
plain editable number while focused. Currency symbols and grouping separators
never enter form state.

## Percentage

The stored value uses percentage points: 12.5 means 12.5%, not 0.125. The
display appends a localized percent sign. Minimum, maximum, step, and precision
normalization occurs on blur.

## Intermediate numeric input

Incomplete text such as a minus sign or decimal separator remains local display
state and does not overwrite the last valid stored number. Empty text stores
undefined. Blur restores formatted output from the last valid normalized value.

## Slider and rating

Slider and rating values are numbers. Range slider values are a two-number tuple
ordered as minimum and maximum.

## Phone, OTP, and PIN

Phone values remain strings so international prefixes and formatting are not
lost. OTP and PIN values contain digits only. PIN segments use password inputs.

## Mask

Mask storage contains only accepted raw characters. Literals exist only in the
display. Mask tokens are 0 for digits, A for letters, and * for alphanumeric
characters.
