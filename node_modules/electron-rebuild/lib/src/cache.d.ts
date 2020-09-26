export declare const cacheModuleState: (dir: string, cachePath: string, key: string) => Promise<void>;
declare type ApplyDiffFunction = (dir: string) => Promise<void>;
export declare const lookupModuleState: (cachePath: string, key: string) => Promise<ApplyDiffFunction | boolean>;
export {};
