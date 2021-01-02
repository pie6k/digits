import { convertStringToParseResult, getParseResultType } from '../src';

describe('result type', () => {
  it('properly detects result type', () => {
    expect(getParseResultType(convertStringToParseResult('457508000'))).toBe('OK');
    expect(getParseResultType(convertStringToParseResult('664371495'))).toBe('ERR');
    expect(getParseResultType(convertStringToParseResult('111111111'))).toBe('ERR');
    expect(getParseResultType(convertStringToParseResult('86110??36'))).toBe('ILL');
  });
});
