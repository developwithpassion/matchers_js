import matchers from './matchers';
import { expect } from 'chai';

const assert_matches = (title, matcher, { matching = [], non_matching = [] } = {}) => {
  describe(title, () => {
    describe(`matches: ${JSON.stringify(matching)}`, () => {
      matching.forEach(item => {
        it(`with: ${JSON.stringify(item)} should be: true`, () => {
          expect(matcher(item)).to.be.true;
        });
      });
    });

    describe(`does not match: ${JSON.stringify(non_matching)}`, () => {
      non_matching.forEach(item => {
        it(`with: ${JSON.stringify(item)} should be: false`, () => {
          expect(matcher(item)).to.be.false;
        });
      });
    });
  });
};

describe('Matchers', function() {
  assert_matches('equal_to', matchers.equal_to(2), { matching: [2], non_matching: [1] });

  assert_matches('equal_to_any_values', matchers.equal_to_any_values(2, 3, 4, 5), {
    matching: [2, 3, 4, 5],
    non_matching: [null, '2', 6, 1, 8]
  });

  assert_matches('anything', matchers.anything, { matching: [2, 3, 4, 5, null, undefined, ''] });

  assert_matches('greater_than', matchers.greater_than(7), {
    matching: [8, 9, 10, 11, 12],
    non_matching: [null, 1, 2, 3, 4]
  });

  assert_matches('less than', matchers.less_than(7), {
    matching: [1, 2, 3, 4, 5, 6, null, '6'],
    non_matching: [8, 9, 10, 11, 12]
  });

  assert_matches('is null or empty', matchers.is_null_or_empty, {
    matching: [null, '', '    '],
    non_matching: [{}]
  });

  assert_matches(
    'and: creates a compositional and match of all provided criteria',
    matchers.and(
      item => item > 10,
      item => item % 2 === 0,
      item => item % 2 === 0
    ),
    {
      matching: [12, 14],
      non_matching: [1, 2, 10, 11]
    }
  );

  assert_matches(
    'creates a compositional or match of all provided criteria',
    matchers.or(
      Number.isInteger,
      item => item > 10,
      item => item % 2 === 0
    ),
    {
      matching: [1, 2, 10, 11, 12, 14]
    }
  );

  assert_matches(
    'equalTo: matches the exact value it was provided using Object.is equality',
    matchers.equal_to(null),
    {
      matching: [null],
      non_matching: [undefined, '']
    }
  );

  describe('between', () => {
    [
      [1, 5, 1, true],
      [1, 5, 2, true],
      [1, 5, 3, true],
      [1, 5, 4, true],
      [1, 5, 5, true],
      [1, 5, 0, false],
      [1, 5, 6, false]
    ].forEach(([start, end, valueToMatch, should_match]) => {
      describe(`${start}-${end} contains ${valueToMatch}`, () => {
        let matcher;
        beforeEach(() => {
          matcher = matchers.between(start, end);
        });

        it(`${should_match}`, () => {
          expect(matcher(valueToMatch)).to.eql(should_match);
        });
      });
    });
  });

  assert_matches('is numeric', matchers.is_numeric, {
    matching: [10, 11, 12],
    non_matching: ['a', {}, [], NaN]
  });

  assert_matches('is integer', matchers.is_numeric, {
    matching: [10, 11, 12],
    non_matching: ['a', {}, []]
  });

  assert_matches('is array', matchers.is_array, {
    matching: [[], [1, 2, 3, 4]],
    non_matching: ['a', 'sdfsdfsdf', {}]
  });

  assert_matches(
    'functional matcher',
    matchers.condition(val => val >= 10),
    {
      matching: [10, 11, 12],
      non_matching: [1, 2, 3, 4]
    }
  );

  assert_matches('null', matchers.is_null, {
    matching: [null],
    non_matching: ['11', 1, 2, {}]
  });

  assert_matches('is string', matchers.is_string, {
    matching: [''],
    non_matching: [['3343'], null, {}]
  });

  assert_matches('is boolean', matchers.is_boolean, {
    matching: [true, false],
    non_matching: [123, 'false', 'true']
  });

  assert_matches('is defined only matches defined values', matchers.is_defined, {
    matching: [1, {}, null, { age: 23 }['age']],
    non_matching: [{}['age'], undefined]
  });

  assert_matches('regex', matchers.regex(/JP/), {
    matching: ['JP Boodhoo'],
    non_matching: [null, 'JE Boodhoo']
  });

  assert_matches('isUndefined only matches the value undefined', matchers.is_undefined, {
    matching: [undefined],
    non_matching: [true, null, 0]
  });

  assert_matches('function', matchers.is_function, {
    matching: [() => {}, function() {}],
    non_matching: [{}, '']
  });

  assert_matches('is object', matchers.is_object, {
    matching: [{}],
    non_matching: [null, undefined, () => {}]
  });

  describe('match negation', function() {
    let sut;

    beforeEach(function() {
      sut = matchers.not;
    });

    it('negates the created matcher method that follows', function() {
      let negated = sut(matchers.equal_to_any_values(10));

      expect(negated(10)).to.be.false;
      expect(negated(1)).to.be.true;

      expect(sut(matchers.greater_than(9))(8)).to.be.true;
      expect(sut(matchers.greater_than(9))(10)).to.be.false;
    });

    it('can combine string testing function', function() {
      let result = matchers.is_string.and(sut(matchers.equal_to('invalid')));

      expect(result('blah')).to.be.true;
      expect(result('invalid')).to.be.false;
    });

    it('still allows chaining to be performed', function() {
      let combined = sut(matchers.equal_to(10)).and(matchers.equal_to(11));
      expect(combined(11)).to.be.true;
      expect(combined(12)).to.be.false;
    });

    it('can chain complex expression', function() {
      let x = matchers;

      let combined = x.not(x.equal_to(1)).and(x.greater_than(10).or(x.between(2, 9)));

      expect(combined(11)).to.be.true;
      expect(combined(8)).to.be.true;
      expect(combined(1)).to.be.false;
    });

    assert_matches('greater than or equal to', matchers.greater_than_or_equal_to(10), {
      matching: [10, 11],
      non_matching: [9]
    });

    assert_matches(
      'any element in an array matches',
      matchers.any_element_matches(matchers.greater_than(10), {
        matching: [1, 2, 3, 4, 10, 11],
        non_matching: [1, 2, 3, 4]
      })
    );

    assert_matches('is false only matches the value false', matchers.is_false, {
      matching: [false],
      non_matching: [true, null, 'up']
    });
  });
});
