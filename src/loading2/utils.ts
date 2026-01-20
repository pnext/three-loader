export function extractBasePath(url: string): string {
  return url.substring(0, url.lastIndexOf('/') + 1);
}

export function buildUrl(basePath: string, fileName: string): string {
  return `${basePath}${fileName}`;
}

export function appendBuffer(buffer1: any, buffer2: any) {
  const tmp = new Uint8Array(buffer1.byteLength + buffer2.byteLength);
  tmp.set(new Uint8Array(buffer1), 0);
  tmp.set(new Uint8Array(buffer2), buffer1.byteLength);
  return tmp.buffer;
}
