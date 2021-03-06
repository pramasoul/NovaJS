import { isLeft } from 'fp-ts/lib/Either';
import * as t from 'io-ts';
import 'jasmine';
import { set } from './set';


describe('Set', () => {
    it('decodes arrays as sets', () => {
        const testArray = [1, 2, 3, 2, 4, 5];

        const decoded = set(t.number).decode(testArray);
        if (isLeft(decoded)) {
            fail(`Expected to decode [${testArray}] successfully`);
            return;
        }

        expect(decoded.right).toEqual(new Set([1, 2, 3, 4, 5]));
    });

    it('encodes sets as arrays', () => {
        const testSet = new Set(['foo', 'bar', 'baz']);

        const encoded = set(t.string).encode(testSet);
        expect(encoded).toEqual(['foo', 'bar', 'baz'])
    });

    it('works on complex types', () => {
        const testArray = [1, 'cat', { x: 'dog' }, 2, { y: 123 }];
        const xStringType = t.type({ x: t.string });
        const yNumberType = t.type({ y: t.number });
        const setValueType = t.union([xStringType, yNumberType, t.number, t.string]);

        const decoded = set(setValueType).decode(testArray);
        if (isLeft(decoded)) {
            fail(`Expected to decode [${testArray}] successfully`);
            return;
        }

        expect(decoded.right).toEqual(new Set(testArray));
    });
});
