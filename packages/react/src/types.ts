import type { FormValues } from '@lourthuxavierm/dynamic-forms-core';

/** Dot-separated paths accepted by React form hooks. */
export type FieldPath<TValues extends FormValues = FormValues> = TValues extends object
  ? {
      [TKey in Extract<keyof TValues, string>]: TValues[TKey] extends readonly unknown[]
        ? TKey | `${TKey}.${number}`
        : TValues[TKey] extends object
          ? TKey | `${TKey}.${FieldPath<Extract<TValues[TKey], FormValues>>}`
          : TKey;
    }[Extract<keyof TValues, string>]
  : string;

export type TypedFieldPath<TValues extends FormValues> = FieldPath<TValues> | (string & {});