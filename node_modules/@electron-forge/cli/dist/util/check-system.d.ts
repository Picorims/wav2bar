import { OraImpl } from '@electron-forge/async-ora';
export declare function validPackageManagerVersion(packageManager: string, version: string, whitelistedVersions: string, ora: OraImpl): boolean;
export default function checkSystem(ora: OraImpl): Promise<boolean>;
