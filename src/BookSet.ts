/* Experiment with a class to represent sets of books */

export interface BookSet {
  values: string[];

  intersect: (other: BookSet) => void;
  difference: (other: BookSet) => void;
  limit: (limiter: string) => void;

  // sorts by given value
  sort: (attrib: string, reverse: boolean) => void;
  reverse: () => void;
}

const intersectUtil = (left: string[], right: string[]): string[] => {
  return left.filter((val) => right.includes(val));
}

const differenceUtil = (left: string[], right: string[]): string[] => {
  return left.filter((val) => !right.includes(val));
}

export abstract class AbstractBookSetModel implements BookSet {
  public values: string[];

  public intersect = (other: AbstractBookSetModel) => {
    this.values = intersectUtil(this.values, other.values);
  }

  public difference = (other: AbstractBookSetModel) => {
    this.values = differenceUtil(this.values, other.values);
  }

  limit: (limiter: string) => void;

  sort: (attrib: string, reverse: boolean) => void;
  reverse: () => void;
}

const code = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';

export class EncoderDecoder {
  public digits: number;
  public base: number;

  public constructor(digits: number, base: number) {
    this.digits = digits;
    this.base = base;
  }

  public encode = (num: number): string => {
    let digits = new Array(this.digits);
    for (let i = 0; i < this.digits; i++) {
      digits[this.digits - i - 1] = code[num % this.base];
      num = (num / this.base) | 0;
    }
    return digits.join('');
  }

  public decode = (str: string): number => {
    let res = 0;
    for (let i = 0; i < this.digits; i++) {
      res = res * this.base + code.indexOf(str[i]);
    }
    return res;
  }
}

export class BookSetModel extends AbstractBookSetModel {
  public digits: number;
  public base: number;

  constructor(str: string, digits: number, base: number) {
    super();
    this.digits = digits;
    this.base = base;
    if (!str) {
      this.values = [];
    } else if (str.includes('-')) {
      this.buildFromRange(str, digits, base);
    } else {
      this.buildFromString(str, digits);
    }
  }

  private buildFromRange = (str: string, digits: number, base: number): void => {
    const encoderdecoder = new EncoderDecoder(digits, base);
    const [start, stop] = str.split('-').map(encoderdecoder.decode);
    const range: number[] = [...Array(stop - start + 1).keys()].map(i => i + start);
    this.values = range.map(encoderdecoder.encode);
  }

  private buildFromString = (str: string, digits: number): void => {
    const regexPattern = ".{1," + digits + "}";
    const regex = new RegExp(regexPattern, 'g');
    this.values = str.match(regex); // split into digits sized chunks
  }

  public limit = (limiter: string): void => {
    const encoderdecoder = new EncoderDecoder(this.digits, this.base);
    const valuesMapped = this.values.map(encoderdecoder.decode);
    const limitingValue = encoderdecoder.decode(limiter);
    this.values = valuesMapped.filter((elem) => elem <= limitingValue).map(encoderdecoder.encode);
  }

  public reverse = () => {
    this.values.reverse();
  }

  public sort = async (attrib: string, reverse: boolean): Promise<void> => {
    if (attrib == 'id') {
      const encoderdecoder = new EncoderDecoder(this.digits, this.base);
      const idsSorted = this.values.map(encoderdecoder.decode);
      idsSorted.sort((valOne, valTwo) => valOne - valTwo);
      if (reverse) {
        idsSorted.reverse();
      }
      this.values = idsSorted.map(encoderdecoder.encode);
    } else if (attrib == 'author' || attrib == 'ratingcount' || attrib == 'rating' || attrib == 'title') {
      const resp = await fetch('content/sort/' + attrib);
      if (resp.ok) {
        const text = await resp.text();
        const other: BookSetModel = new BookSetModel(text, this.digits, this.base);
        other.intersect(this);
        this.values = other.values;
        if (reverse) {
          this.values.reverse();
        }
      }
    }
  }
}

export default BookSet;
