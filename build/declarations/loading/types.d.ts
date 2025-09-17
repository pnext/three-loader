export type GetUrlFn = (url: string) => string | Promise<string>;
export type XhrRequest = (input: RequestInfo, init?: RequestInit) => Promise<Response>;
