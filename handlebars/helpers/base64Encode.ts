import { readFileSync, existsSync } from 'fs';
import { join, normalize, relative, isAbsolute } from 'path';

/**
 * Reads in a file and encodes it as base64
 * @param {string} asset_dir directory for assets
 * @param {string} filePath file to read in and encode as base64
 * @returns {string} base64 encoding of file
 */
const base64Encode = (asset_dir: string, filePath: string): string => {
  const finalFilePath = normalize(join(asset_dir, filePath));
  const relative_path = relative(asset_dir, finalFilePath);

  const is_child =
    relative_path &&
    !relative_path.startsWith('..') &&
    !isAbsolute(relative_path);

  if (!is_child) {
    throw new Error(`${filePath} went out of ${asset_dir}, not reading`);
  }

  if (!existsSync(finalFilePath)) {
    return '';  // caller can't handle exceptions, but can handle empty str
  }

  return readFileSync(finalFilePath).toString('base64');
};

export default base64Encode;
