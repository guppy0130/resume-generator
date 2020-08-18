const {
    filterObj
} = require('../lib');
const assert = require('assert');

describe('filterObj', function() {
    it('filters a basic object', function () {
        const toFilter = [
            { college: 'appears', tags: ['yes'] },
            { college: 'does not appear', tags: ['no'] },
        ];
        const expected = [
            { college: 'appears', tags: ['yes'] },
        ];

        assert.deepStrictEqual(filterObj(toFilter, 'yes'), expected);
    });

    it('filters nothing with no matched tags', function () {
        const toFilter = [
            { college: 'does not appear', tags: ['no'] },
        ];
        const expected = [];

        assert.deepStrictEqual(filterObj(toFilter, 'yes'), expected);
    });

    it('filters at any level', function () {
        const toFilter = [
            {
                college: {
                    classes: [
                        {name: 'class1', tags: ['yes']},
                        {name: 'class2', tags: ['no']},
                    ]
                },
            },
            {
                college: {
                    classes: [
                        {name: 'class1', tags: ['yes']},
                    ]
                }
            },
        ];
        const expected = [
            {
                college: {
                    classes: [ {name: 'class1', tags: ['yes']}, ]
                },
            },
            {
                college: {
                    classes: [ {name: 'class1', tags: ['yes']}, ]
                }
            },
        ];

        assert.deepStrictEqual(filterObj(toFilter, 'yes'), expected);
    });

    it('filters at all levels', function () {
        const toFilter = [
            {
                college: {
                    classes: [
                        {name: 'class1', tags: ['yes']},
                        {name: 'class2', tags: ['no']},
                    ]
                },
                tags: ['yes']
            },
            { college: 'does not appear', tags: ['no'] },
        ];
        const expected = [
            {
                college: {
                    classes: [
                        {name: 'class1', tags: ['yes']},
                    ]
                },
                tags: ['yes']
            },
        ];

        assert.deepStrictEqual(filterObj(toFilter, 'yes'), expected);
    });
});
