import { any, true_for_all } from '@developwithpassion/arrays_js';

const extend = matcher => {
  const extended_matcher = (...args) => matcher(...args);

  extended_matcher.and = other => and(matcher, other);
  extended_matcher.or = other => or(matcher, other);

  return extended_matcher;
};

const combineAnd = (first, second) => condition(item => first(item) && second(item));

const combineOr = (first, second) => condition(item => first(item) || second(item));

const combineMatchers = (combineStrategy, initialMatcher) => (...criterion) =>
  extend(criterion.reduce((acc, criteria) => combineStrategy(acc, criteria), initialMatcher));

export const condition = criteria => extend((...args) => criteria(...args));

export const never_matches = condition(() => false);

export const anything = condition(() => true);

export const and = combineMatchers(combineAnd, anything);

export const or = combineMatchers(combineOr, never_matches);

export const not = other => extend((...args) => !other(...args));

export const is_null = condition(value => value === null);

export const is_defined = condition(value => typeof value !== 'undefined');

export const is_undefined = not(is_defined);

export const is_null_or_undefined = is_null.or(is_undefined);

export const is_not_null_or_undefined = not(is_null_or_undefined);

export const is_type = expected_type => not(is_null_or_undefined).and(val => typeof val === expected_type);

export const is_string = is_type('string');

export const is_boolean = is_type('boolean');

export const equal_to_any_values = (...values) => condition(val => values.indexOf(val) > -1);

export const equal_to = value => condition(val => val === value);

export const regex = pattern => condition(val => pattern.test(val));

export const greater_than = val => condition(value => value > val);

export const is_empty = condition(value => value.trim() === '');

export const less_than = val => condition(value => value < val);

export const any_element_matches = element_criteria =>
  condition(target_array => any(element_criteria, target_array));

export const all_elements_match = element_criteria =>
  condition(target_array => true_for_all(element_criteria, target_array));

export const greater_than_or_equal_to = value => greater_than(value).or(equal_to(value));

export const less_than_or_equal_to = value => less_than(value).or(equal_to(value));

export const between = (start, end) => greater_than_or_equal_to(start).and(less_than_or_equal_to(end));

export const is_numeric = is_type('number').and(not(isNaN));

export const is_function = is_type('function');

export const is_object = is_type('object');

export const is_integer = is_numeric.and(val => val % 1 === 0);

export const is_null_or_empty = is_null.or(is_string.and(is_empty));

export const is_array = condition(Array.isArray);

export const is_true = equal_to(true);

export const is_false = equal_to(false);

export default {
  condition,

  not,

  equal_to,

  is_null,

  never_matches,

  anything,

  is_string,

  regex,

  is_boolean,

  is_defined,

  is_undefined,

  equal_to_any_values,

  greater_than,

  is_empty,

  less_than,

  any_element_matches,

  all_elements_match,

  between,

  greater_than_or_equal_to,

  is_null_or_undefined,

  is_not_null_or_undefined,

  is_numeric,

  is_function,

  is_object,

  is_integer,

  is_null_or_empty,

  is_array,

  is_true,

  is_false,

  and,

  or
};
