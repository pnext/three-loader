export function extractBasePath(url: string): string {
    return url.substring(0, url.lastIndexOf('/') + 1);
}

export function buildUrl(basePath: string, fileName: string): string {
    return `${basePath}${fileName}`;
}
