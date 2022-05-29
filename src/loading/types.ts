export type GetUrlFn = (url: string, index: number) => string | Promise<string>;
export type XhrRequest = (input: RequestInfo, init?: RequestInit) => Promise<Response>;
