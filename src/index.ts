type UnknownDigit = '?';
type ParsedDigit = '0' | '1' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9';
type ParseResult = Array<ParsedDigit | UnknownDigit>;

/**
 * List of known, parsable digits.
 *
 * They're written as array of strings we'll look for in the entry.
 */

// Let's take care of eyes of fellow developers looking at it and tell prettier to keep it multi-line.

// prettier-ignore
const zero = [
  ' _ ',
  '| |',
  '|_|'
];

// prettier-ignore
const one = [
  '   ',
  '  |',
  '  |'
];

// prettier-ignore
const two = [
  ' _ ',
  ' _|',
  '|_ '
];

// prettier-ignore
const three = [
  ' _ ',
  ' _|',
  ' _|'
];

// prettier-ignore
const four = [
  '   ',
  '|_|',
  '  |'
];

// prettier-ignore
const five = [
  ' _ ',
  '|_ ',
  ' _|'
];

// prettier-ignore
const six = [
  ' _ ',
  '|_ ',
  '|_|'
];

// prettier-ignore
const seven = [
  ' _ ',
  '  |',
  '  |'
];

// prettier-ignore
const eight = [
  ' _ ',
  '|_|',
  '|_|'
];

// prettier-ignore
const nine = [
  ' _ ',
  '|_|',
  ' _|'
];

// This is redundant as we know each digit is 3 chars long looking at data above, but I'm
// defining it here again to make code that validates it easier to read.
const DIGIT_WIDTH = 3;

/**
 * This function will extract only one digit data from full entry row.
 *
 * Result will be array of 3 strings with 3 chars each.
 */
function pickDigitRowsFromEntryRows(entryRows: string[], digitIndex: number) {
  return entryRows.map((row) => {
    return row.substr(digitIndex * DIGIT_WIDTH, DIGIT_WIDTH);
  });
}

/**
 * Will parse rows for single entry.
 *
 * It expects array of 3 strings containing entry rows.
 */
export function parseSingleEntryRows(
  entryRows: string[],
  expectedDigitsCount: number,
): ParseResult {
  if (entryRows.length !== 3) {
    throw new Error('Incorrect rows input');
  }

  return Array.from({ length: expectedDigitsCount }).map((_, digitIndex) => {
    const digitRows = pickDigitRowsFromEntryRows(entryRows, digitIndex);

    const parsedDigit = parseRowDigit(digitRows);

    return parsedDigit;
  });
}

/**
 * Will parse rows of file that contain multiple entries data.
 */
export function parseEntriesFileRows(
  fileRows: string[],
  expectedDigitsCount: number,
): ParseResult[] {
  if (fileRows.length % 4 !== 0) {
    throw new Error(
      'Incorrect file input. File must contain number of lines that is multiply of 4',
    );
  }

  const entriesCount = fileRows.length / 4;

  return Array.from({ length: entriesCount }).map((_, entryIndex) => {
    const startRowIndex = entryIndex * 4;

    // Pick only rows corresponding to given entry
    const entryRows = fileRows.slice(startRowIndex, startRowIndex + 3);

    return parseSingleEntryRows(entryRows, expectedDigitsCount);
  });
}

/**
 * Will parse raw file content containing multiple entries into array of results.
 */
export function parseEntriesFileContent(
  fileContent: string,
  expectedDigitsCount: number,
): ParseResult[] {
  const fileRows = fileContent.split('\n');

  return parseEntriesFileRows(fileRows, expectedDigitsCount);
}

/**
 * Utils
 */

function parseRowDigit(digitRows: string[]): ParsedDigit | UnknownDigit {
  if (digitRows.length !== 3) {
    throw new Error('Incorrect digitrows input');
  }

  if (areRowsEqual(digitRows, zero)) return '0';
  if (areRowsEqual(digitRows, one)) return '1';
  if (areRowsEqual(digitRows, two)) return '2';
  if (areRowsEqual(digitRows, three)) return '3';
  if (areRowsEqual(digitRows, four)) return '4';
  if (areRowsEqual(digitRows, five)) return '5';
  if (areRowsEqual(digitRows, six)) return '6';
  if (areRowsEqual(digitRows, seven)) return '7';
  if (areRowsEqual(digitRows, eight)) return '8';
  if (areRowsEqual(digitRows, nine)) return '9';

  return '?';
}

function convertDigitToNumber(digit: ParsedDigit): number {
  return parseInt(digit, 10);
}

/**
 * Will check if all digits of parse results are readable.
 *
 * It will also narrow-down the type of result to be array of readable digits.
 */
function isParseResultReadable(parseResult: ParseResult): parseResult is Array<ParsedDigit> {
  if (parseResult.includes('?')) {
    return false;
  }

  return true;
}

function invertArray<T>(input: T[]): T[] {
  return [...input].reverse();
}

function getParseResultCheckSum(parseResult: ParseResult) {
  if (!isParseResultReadable(parseResult)) {
    throw new Error('Cannot calculate checksum for result that is not readable');
  }

  return invertArray(parseResult).reduce((checksumBuffer, nextDigit, digitIndex) => {
    const digitNaturalIndex = digitIndex + 1;
    const nextDigitNumber = convertDigitToNumber(nextDigit);
    return checksumBuffer + nextDigitNumber * digitNaturalIndex;
  }, 0);

  // account number:  3  4  5  8  8  2  8  6  5
  // position names:  d9 d8 d7 d6 d5 d4 d3 d2 d1
  // checksum calculation: (d1+2*d2+3*d3 +..+9*d9) mod 11 = 0
}

function isChecksumValid(checksum: number) {
  return checksum % 11 === 0;
}

function areRowsEqual(a: string[], b: string[]) {
  if (a.length !== b.length) {
    return false;
  }

  return a.every((item, index) => {
    return item === b[index];
  });
}

export type ParseResultType = 'OK' | 'ILL' | 'ERR';

export function getParseResultType(result: ParseResult): ParseResultType {
  if (!isParseResultReadable(result)) {
    return 'ILL';
  }

  const checksum = getParseResultCheckSum(result);

  if (!isChecksumValid(checksum)) {
    return 'ERR';
  }

  return 'OK';
}

export function printParseResult(parseResult: ParseResult) {
  const resultType = getParseResultType(parseResult);

  const resultContent = parseResult.join('');

  if (resultType === 'OK') {
    return resultContent;
  }

  return `${resultContent} ${resultType}`;
}

export function printParseResults(parseResults: ParseResult[]) {
  return parseResults.map(printParseResult).join('\n');
}

function parseStringCharToDigit(char: string): ParsedDigit | UnknownDigit {
  if (char.length !== 1) {
    throw new Error('Cannot parse non chars');
  }

  if (parseInt(char) >= 0) {
    return char as ParsedDigit;
  }

  return '?';
}

export function convertStringToParseResult(input: string): ParseResult {
  return input.split('').map((inputChar) => {
    return parseStringCharToDigit(inputChar);
  });
}
