import type { Condition } from "./types";

export function evaluateCondition(
  condition: Condition,
  values: Record<string, unknown>
): boolean {
  const actual = values[condition.field];

  switch (condition.operator) {
    case "equals":
      return actual === condition.value;

    case "notEquals":
      return actual !== condition.value;

    case "exists":
      return actual !== undefined && actual !== null;

    case "notExists":
      return actual === undefined || actual === null;

    case "contains":
      return Array.isArray(actual)
        ? actual.includes(condition.value)
        : typeof actual === "string"
          ? actual.includes(String(condition.value))
          : false;

    case "greaterThan":
      return Number(actual) > Number(condition.value);

    case "lessThan":
      return Number(actual) < Number(condition.value);

    default:
      return false;
  }
}
