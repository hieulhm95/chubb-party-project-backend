export const convertBase64 = (str: string): string => {
  return Buffer.from(str).toString('base64');
};

export function decodeBase64(encodedStr: string): string {
  return Buffer.from(encodedStr, 'base64').toString('utf-8');
}
