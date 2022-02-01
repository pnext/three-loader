export declare type GetUrlFn = (url: string) => string | Promise<string>;
export declare type XhrRequest = (input: RequestInfo, init?: RequestInit) => Promise<Response>;
