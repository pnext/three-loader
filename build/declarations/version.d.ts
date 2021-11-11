export declare class Version {
    version: string;
    versionMajor: number;
    versionMinor: number;
    constructor(version: string);
    newerThan(version: string): boolean;
    equalOrHigher(version: string): boolean;
    upTo(version: string): boolean;
}
