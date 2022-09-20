import { readFileSync } from 'fs';

/**
 * Reads in a file and encodes it as base64
 * @param filePath file to read in and encode as base64
 * @returns base64 encoding of file
 */
const base64Encode = (filePath: string) => {
  return readFileSync(filePath).toString('base64');
};

export default base64Encode;
