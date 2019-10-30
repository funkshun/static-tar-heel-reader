import {
  BookSet,
  Intersection,
  Difference,
  Limit,
  RangeSet,
  StringSet,
  ArraySet
} from "./BookSet";

const digits = 2;
const base = 16;
const sets = [
  "", // empty
  "1A293648596E", // boy
  "3662656E6F828A94AF", // girl
  "1950727D8587", // cat
  "02131B29364C50585A686E717A9A9C" // dog
];
let setset = [];
for (const s1 of sets) {
  for (const s2 of sets) {
    setset.push([s1, s2]);
  }
}

/* limits for RangeSets */
const limits = ["01", "36", "6E", "AF", "9C", "AA"];
let setlimit = [];
let limitset = [];
for (const s1 of sets) {
  for (const l1 of limits) {
    setlimit.push([s1, l1]);
    limitset.push([l1, s1]);
  }
}

/* Test helpers */

/* convert a set to an array */
function s2a(s: string) {
  const a = s.match(/../g);
  return a || [];
}

/* pull all the values from BookSet into an array */
function pull(bs: BookSet) {
  const r = [];
  let c;
  while ((c = bs.next())) {
    r.push(c);
  }
  return r;
}

/* compute the intersection using sets */
function intersect(s1: string, s2: string): string[] {
  const S1 = new Set(s2a(s1));
  const S2 = new Set(s2a(s2));
  const R = new Set();
  for (const elem of S1) {
    if (S2.has(elem)) {
      R.add(elem);
    }
  }
  return Array.from(R).sort() as string[];
}

/* compute the difference using sets */
function difference(s1: string, s2: string): string[] {
  const S1 = new Set(s2a(s1));
  const S2 = new Set(s2a(s2));
  const R = new Set();
  for (const elem of S1) {
    if (!S2.has(elem)) {
      R.add(elem);
    }
  }
  return Array.from(R).sort() as string[];
}

/* limit an array to values less than l */
function limit(A: string[], l: string) {
  return A.filter(s => s <= l);
}

test.each(sets)("StringSet(%s)", s => {
  expect(pull(new StringSet(s, digits))).toEqual(s2a(s));
});

test.each(setset)("Intersection(%s, %s)", (s1, s2) => {
  expect(
    pull(new Intersection(new StringSet(s1, digits), new StringSet(s2, digits)))
  ).toEqual(intersect(s1, s2));
});

test.each(setset)("Difference(%s, %s)", (s1, s2) => {
  expect(
    pull(new Difference(new StringSet(s1, digits), new StringSet(s2, digits)))
  ).toEqual(difference(s1, s2));
});

test.each(setlimit)("Intersection(%s, RangeSet('00', %s))", (s, l) => {
  expect(
    pull(
      new Intersection(
        new StringSet(s, digits),
        new RangeSet("00", l, digits, base)
      )
    )
  ).toEqual(limit(s2a(s), l));
});

test.each(limitset)("Intersection(RangeSet('00', %s), %s)", (l, s) => {
  expect(
    pull(
      new Intersection(
        new StringSet(s, digits),
        new RangeSet("00", l, digits, base)
      )
    )
  ).toEqual(limit(s2a(s), l));
});

test.each(setlimit)("Limit(%s, %s)", (s, l) => {
  expect(pull(new Limit(new StringSet(s, digits), l))).toEqual(
    limit(s2a(s), l)
  );
});

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

test('Test ArraySet next', () => {
  // generate some random strings
  const testStrings = 10;
  const strs = genRandomStrings(testStrings);

  let arraySet = new ArraySet(strs);
  let idx = 0;
  while (idx < testStrings) {
    expect(arraySet.next()).toEqual(strs[idx]);
    idx++;
  }
  idx = 0;
  while (idx < testStrings) {
    expect(arraySet.next()).toEqual('');
    idx++;
  }
});

test('Test ArraySet skipTo', () => {
  const testStrings = 10;
  const strs = genRandomStrings(testStrings);

  let idx = 0;
  while(idx < testStrings) {
    let arraySet = new ArraySet(strs);
    // find a random string to skip ahead to
    let randomString = strs[Math.floor(Math.random() * strs.length)];
    expect(arraySet.skipTo(randomString)).toEqual(randomString);
    idx++;
  }

  const vals = ['apples', 'bananas', 'oranges'];
  let arraySet = new ArraySet(vals);
  expect(arraySet.skipTo('bae')).toEqual('bananas');
  expect(arraySet.skipTo('baseball')).toEqual('oranges');
  expect(arraySet.skipTo('oranges')).toEqual('oranges');
  expect(arraySet.skipTo('zebras')).toEqual('');
});

test('Intersection skipTo', () => {
  let numsOne = ['one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten'];
  let numsTwo = ['one', 'four', 'nine', 'sixteen', 'twenty-five'];

  numsOne = numsOne.sort();
  numsTwo = numsTwo.sort();

  let intersect = new Intersection(new ArraySet(numsOne), new ArraySet(numsTwo));
  expect(intersect.skipTo('four')).toEqual('four');
  expect(intersect.skipTo('help')).toEqual('nine');
  expect(intersect.skipTo('nine')).toEqual('nine');
  expect(intersect.skipTo('one')).toEqual('one');
  expect(intersect.skipTo('zebra')).toEqual('');
});

test('Difference skipTo', () => {
  let numsOne = ['one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten'];
  let numsTwo = ['one', 'four', 'nine', 'sixteen', 'twenty-five'];

  numsOne = numsOne.sort();
  numsTwo = numsTwo.sort();

  let diff = new Difference(new ArraySet(numsOne), new ArraySet(numsTwo));

  expect(diff.skipTo('five')).toEqual('five');
  expect(diff.skipTo('four')).toEqual('seven');
});

test('Limit skipTo', () => {
  let strs = ['apple', 'banana', 'orange', 'peach', 'grape', 'blueberry', 'grapefruit'];
  strs = strs.sort();

  const limit = new Limit(new ArraySet(strs), strs[Math.floor(strs.length/2)]);

  expect(limit.skipTo('banana')).toEqual('banana');
  expect(limit.skipTo('grape')).toEqual('grape');
  expect(limit.skipTo('orange')).toEqual('');
});

test('RangeSet skipTo', () => {
  let rangeset = new RangeSet('02', '10', 2, 16);
  expect(rangeset.skipTo('01')).toEqual('02');
})