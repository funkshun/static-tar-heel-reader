import {
  BookSet,
  BookSetModel,
  EncoderDecoder
} from "../src/BookSet";

const digits = 2;
const base = 16;

const genRandomStrings = (numStrings: number): string[] => {
  const chars = 'abcdefghjiklmnopqrstuvwxyz';
  const charsLen = chars.length;
  let strs: string[] = [];
  const stringLen = 5;

  for (let i = 0; i < numStrings; i++) {
    let result = '';
    for (let l = 0; l < stringLen; l++) {
      result += chars.charAt(Math.floor(Math.random() * charsLen));
    }
    strs.push(result);
  }

  strs.sort();
  return strs;
}

const code = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';

const makeARandomStringInBase = (len: number, base: number): string => {
  let res = '';
  for (let i = 0; i < len; i++) {
    res += code.charAt(Math.floor(Math.random() * base));
  }
  return res;
}

test('Creation of BookSet from string', () => {
  const tests = 5;
  const digitsOptions = [2, 3];
  const baseOptions = [16, 36];
  for (let digit of digitsOptions) {
    for (let base of baseOptions) {
      const len = digit * tests;
      for (let i = 0; i < tests; i++) {
        const str = makeARandomStringInBase(len, base);
        const bookset = new BookSetModel(str, digit, base);
        const result = [];
        let slice;
        let curr = 0;
        while ((slice = str.slice(curr, curr + digit)) != '') {
          result.push(slice);
          curr += digit;
        }
        expect(bookset.values).toEqual(result);
      }
    }
  }
});

test('Creation of BookSet from range', () => {
  const digitsOptions = [2, 3];
  const baseOptions = [16, 36];
  const ends = [10, 56, 115];
  for (let digit of digitsOptions) {
    for (let base of baseOptions) {
      for (let end of ends) {
        const encoderdecoder = new EncoderDecoder(digit, base);
        const str = encoderdecoder.encode(0) + '-' + encoderdecoder.encode(end);
        const bookset = new BookSetModel(str, digit, base);
        const arr = new Array(end + 1);
        expect(bookset.values.map(encoderdecoder.decode)).toEqual([...arr.keys()]);
      }
    }
  }
});

test('Intersection', () => {
  const strOne = 'aabbzzddii';
  const strTwo = 'bbzzjjkkllppooqq';
  const booksetOne = new BookSetModel(strOne, 2, 16);
  const booksetTwo = new BookSetModel(strTwo, 2, 16);
  booksetOne.intersect(booksetTwo);
  expect(booksetOne.values).toEqual(['bb', 'zz']);
});

test('Difference', () => {
  const strOne = 'aabbzzddii';
  const strTwo = 'bbzzjjkkllppooqq';
  const booksetOne = new BookSetModel(strOne, 2, 16);
  const booksetTwo = new BookSetModel(strTwo, 2, 16);
  booksetOne.difference(booksetTwo);
  expect(booksetOne.values).toEqual(['aa', 'dd', 'ii']);
});

test('Limit', () => {
  const digits = [2, 3];
  const bases = [16, 36];
  const ends = [10, 56, 115];
  for (let digit of digits) {
    for (let base of bases) {
      for (let end of ends) {
        const encoderdecoder = new EncoderDecoder(digit, base);
        const str = encoderdecoder.encode(0) + '-' + encoderdecoder.encode(end);
        const bookset = new BookSetModel(str, digit, base);
        const limit = encoderdecoder.encode(Math.floor(Math.random() * end));
        bookset.limit(limit);
        const result = [...new Array(encoderdecoder.decode(limit) + 1).keys()];
        expect(bookset.values.map(encoderdecoder.decode)).toEqual(result);
      }
    }
  }
});

test('Empty String', () => {
  const booksetEmpty = new BookSetModel('', digits, base);
  expect(booksetEmpty.values).toEqual([]);
});

test('Reverse', () => {
  const digits = [2, 3];
  const bases = [16, 36];
  const ends = [10, 56, 115];
  for (let digit of digits) {
    for (let base of bases) {
      for (let end of ends) {
        const encoderdecoder = new EncoderDecoder(digit, base);
        const str = encoderdecoder.encode(0) + '-' + encoderdecoder.encode(end);
        const bookset = new BookSetModel(str, digit, base);
        bookset.reverse();
        const result = [...new Array(end + 1).keys()];
        result.reverse();
        expect(bookset.values.map(encoderdecoder.decode)).toEqual(result);
      }
    }
  }
});