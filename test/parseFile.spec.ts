import fs from 'fs';
import path from 'path';

import { parseEntriesFileContent, printParseResults } from '../src';

function readFileToString(filePath: string) {
  return fs.readFileSync(filePath).toString();
}

describe('files of entries parser', () => {
  it('will properly parse file containing one entry', () => {
    const content = readFileToString(path.resolve(__dirname, 'file1.txt'));

    const results = parseEntriesFileContent(content, 9);

    expect(printParseResults(results)).toEqual('123456789');
  });

  it('will properly parse file containing multiple entries', () => {
    const content = readFileToString(path.resolve(__dirname, 'file1-multiple.txt'));

    const result = parseEntriesFileContent(content, 9);

    expect(printParseResults(result)).toMatchInlineSnapshot(`
      "000000000
      111111111 ERR
      22222222? ILL
      333333333 ERR
      ????????? ILL
      555555555 ERR
      666666666 ERR
      777777777 ERR
      888888888 ERR
      999999999 ERR
      123456789
      000000051
      49006771? ILL
      1234?678? ILL"
    `);
  });

  it('will throw when trying to parse incorrect file', () => {
    const filePath = path.resolve(__dirname, 'incorrect-file.txt');
    const content = readFileToString(filePath);

    expect(() => {
      parseEntriesFileContent(content, 9);
    }).toThrowErrorMatchingInlineSnapshot(
      `"Incorrect file input. File must contain number of lines that is multiply of 4"`,
    );
  });
});
