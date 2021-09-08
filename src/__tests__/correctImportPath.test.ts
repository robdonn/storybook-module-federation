import os from 'os';
import { correctImportPath } from '../correctImportPath';

jest.mock('os', () => ({
  platform: jest.fn(),
}));

describe('correctImportPath', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should return correct path on non-windows systems', () => {
    (os.platform as jest.Mock).mockReturnValueOnce('non-win32');

    const actual = correctImportPath('/context/path', '/path/to/file.js');

    expect(actual).toEqual('/path/to/file.js');
  });

  it.each([
    ['.\\file.js', './file.js'],
    ['..\\thisfile.js', '../thisfile.js'],
    ['C:\\\\path\\to\\dir\\otherfile.js', './otherfile.js'],
    ['c:\\\\path\\to\\dir\\otherfile.js', './otherfile.js'],
    ['C:\\\\path\\to\\dir\\node_modules\\@scope\\module', '@scope/module'],
    ['@scope\\module', '@scope/module'],
  ])(
    'should return correct path on windows systems - %s',
    (entryFile: string, output: string) => {
      (os.platform as jest.Mock).mockReturnValueOnce('win32');

      const actual = correctImportPath('C:\\path\\to\\dir', entryFile);

      expect(actual).toEqual(output);
    }
  );
});
