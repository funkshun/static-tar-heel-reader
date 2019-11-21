/* Experiment with a class to represent sets of books */

export interface BookSet {
  /* next() provides the next book id in sequence or "" when exhausted */
  next: () => string;

  /* skipTo(value) returns the next bid equal to or greater than value
   * or "" if exhausted */
  skipTo: (value: string) => string;
}

/* incrementally computes the intersection of two sets */
export class Intersection implements BookSet {
  constructor(public A: BookSet, public B: BookSet) { }

  /* a helper to advance both sequences until they match */
  align(a: string, b: string): string {
    while (a && b && a != b) {
      if (a < b) {
        a = this.A.skipTo(b);
      } else {
        b = this.B.skipTo(a);
      }
    }
    return ((a && b) && a == b) ? a : '';
  }

  public next(): string {
    /* we know we can call next on both because they must have matched
     * last time */
    let a = this.A.next();
    let b = this.B.next();
    return this.align(a, b);
  }

  public skipTo(val: string): string {
    let a = this.A.skipTo(val);
    let b = this.B.skipTo(a);
    return this.align(a, b);
  }
}

/* incrementally computes the values in A that are not in B */
export class Difference implements BookSet {
  constructor(public A: BookSet, public B: BookSet) { }

  public next(): string {
    let a = this.A.next();
    let b = this.B.skipTo(a);
    while (a && b && a == b) {
      a = this.A.next();
      b = this.B.skipTo(a);
    }
    return a;
  }

  public skipTo(val: string): string {
    let a = this.A.skipTo(val);
    let b = this.B.skipTo(a);
    while (a && b && a == b) {
      a = this.A.next();
      b = this.B.skipTo(a);
    }
    return a;
  }
}

export class Limit implements BookSet {
  constructor(public A: BookSet, public limit: string) { }

  public next(): string {
    try {
    const result = this.A.next();
    return (result && result <= this.limit) ? result : "";
    } catch (e) {
      console.log("Error: " + e);
    }
  }

  public skipTo(val: string): string {
    const result = this.A.skipTo(val);
    return (result && result <= this.limit) ? result : "";
  }
}

const code = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';

export class RangeSet implements BookSet {
  constructor(
    public start: string,
    public stop: string,
    public digits: number,
    public base: number,
  ) { }

  current: string;
  currentNum: number;

  public next(): string {
    if (this.current == null) {
      this.current = this.start;
      this.currentNum = 0;
      return this.current;
    } else if (this.current == '') {
      return '';
    }
    this.currentNum += 1;
    this.current = this.encode(this.currentNum);
    if (this.current > this.stop) {
      return '';
    }
    return this.current;
  }

  public skipTo(val: string) {
    if (val < this.start) {
      val = this.start;
    }
    this.current = val;
    if (val > this.stop) {
      return '';
    }
    return val;
  }

  encode(num: number): string {
    let digits = new Array(this.digits);
    for (let i = 0; i < this.digits; i++) {
      digits[this.digits - i - 1] = code[num % this.base];
      num = (num / this.base) | 0;
    }
    return digits.join('');
  }

  decode(str: string): number {
    let res = 0;
    for (let i = 0; i < this.digits; i++) {
      res = res * this.base + code.indexOf(str[i]);
    }
    return res;
  }
}

export class StringSet implements BookSet {
  public index: number;

  constructor(public values: string, public digits: number) {
    this.index = -digits;
  }

  public next(): string {
    this.index += this.digits;
    // if slice goes out of bounds (e.g. 13 in a 12 length string)
    // then it returns ''
    return this.values.slice(this.index, this.index + this.digits);
  }

  public skipTo(val: string) {
    let curr, idx = Math.max(0, this.index);
    while ((curr = this.values.slice(idx, idx + this.digits)) && curr < val) {
      if (curr == '') {
        break;
      }
      idx += this.digits;
    }
    this.index = idx;
    return curr;
  }
}

export class ArraySet implements BookSet {
  public index: number;
  constructor(public values: string[]) {
    this.index = -1;
  }

  public next(): string {
    this.index += 1;
    if (this.index >= this.values.length) {
      return '';
    }
    return this.values[this.index];
  }
  public skipTo(val: string) {
    let curr, idx = Math.max(0, this.index);
    if (idx >= this.values.length) {
      return '';
    }
    while ((curr = this.values[idx]) && curr < val) {
      idx += 1;
    }
    this.index = idx;
    return (curr) ? curr : '';
  }
}

export default BookSet;
