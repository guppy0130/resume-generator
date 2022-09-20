import { filterObj } from '../lib';
import assert from 'assert';

describe('filterObj', function () {
  it('filters a basic list of objects', function () {
    const toFilter = [
      { college: 'appears', positions: ['yes'] },
      { college: 'does not appear', positions: ['no'] },
    ];
    const expected = [{ college: 'appears', positions: ['yes'] }];

    assert.deepStrictEqual(filterObj(toFilter, 'yes'), expected);
  });

  it('filters a basic object', function () {
    const toFilter = { key: 'string', positions: ['no'] };
    assert.deepStrictEqual(filterObj(toFilter, 'yes'), null);
  });

  it('filters nothing with no matched positions', function () {
    const toFilter = [{ college: 'does not appear', positions: ['no'] }];
    // it should just be empty, so give it a random type
    const expected: object[] = [];

    assert.deepStrictEqual(filterObj(toFilter, 'yes'), expected);
  });

  it('filters at any level', function () {
    const toFilter = [
      {
        college: {
          classes: [
            { name: 'class1', positions: ['yes'] },
            { name: 'class2', positions: ['no'] },
          ],
        },
      },
      {
        college: {
          classes: [{ name: 'class1', positions: ['yes'] }],
        },
      },
    ];
    const expected = [
      {
        college: {
          classes: [{ name: 'class1', positions: ['yes'] }],
        },
      },
      {
        college: {
          classes: [{ name: 'class1', positions: ['yes'] }],
        },
      },
    ];

    assert.deepStrictEqual(filterObj(toFilter, 'yes'), expected);
  });

  it('filters at all levels', function () {
    const toFilter = [
      {
        college: {
          classes: [
            { name: 'class1', positions: ['yes'] },
            { name: 'class2', positions: ['no'] },
          ],
        },
        positions: ['yes'],
      },
      { college: 'does not appear', positions: ['no'] },
    ];
    const expected = [
      {
        college: {
          classes: [{ name: 'class1', positions: ['yes'] }],
        },
        positions: ['yes'],
      },
    ];

    assert.deepStrictEqual(filterObj(toFilter, 'yes'), expected);
  });
});
