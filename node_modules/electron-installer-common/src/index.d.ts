import { CopyFilterAsync, CopyFilterSync } from 'fs-extra';
export { spawn } from '@malept/cross-spawn-promise';

export type CatchableFunction = (err: Error) => void;

export type Configuration = {
  arch?: string;
  bin?: string;
  categories?: string[];
  description?: string;
  execArguments?: string[];
  genericName?: string;
  homepage?: string;
  mimeType?: string[];
  name?: string;
  productDescription?: string;
  productName?: string;
  revision?: string;
};

export type DependencyType = 'atspi' | 'drm' | 'gbm' | 'gconf' | 'glib2' | 'gtk2' | 'gtk3' | 'gvfs' | 'kdeCliTools' | 'kdeRuntime' | 'notify' | 'nss' | 'trashCli' | 'uuid' | 'xcbDri3' | 'xss' | 'xtst' | 'xdgUtils';

export type DependencyMap = Record<DependencyType, string>;

export type ReadMetadataOptions = {

  logger: (msg: string) => void;
  src: string;
};

export type PackageJSON = Record<string, unknown>;

export type UserSuppliedOptions = {
  src?: string;
  options?: Record<string, unknown>;
} & Record<string, unknown>;

export class ElectronInstaller {
  constructor(userSupplied: UserSuppliedOptions);

  readonly appIdentifier: string;
  readonly baseAppDir: string;
  readonly contentFunctions: string[];
  readonly defaultDesktopTemplatePath: string;
  readonly pixmapIconPath: string;
  readonly sourceDir: string | undefined;
  readonly stagingAppDir: string;

  copyApplication(ignoreFunc: CopyFilterAsync | CopyFilterSync): Promise<void>;
  copyHicolorIcons(): Promise<void>;
  copyIcon(src: string, dest: string): Promise<void>;
  copyLicense(copyrightFile: string): Promise<void>;
  copyLinuxIcons(): Promise<void>;
  copyPixmapIcon(): Promise<void>;
  createBinarySymlink(): Promise<void>;
  createContents(): Promise<void>;
  createCopyright(): Promise<void>;
  createDesktopFile(): Promise<void>;
  createStagingDir(): Promise<void>;
  createTemplatedFile(): Promise<void>;
  generateOptions(): void;
  movePackage(): Promise<void>;
  updateSandboxHelperPermissions(): Promise<void>;
}

export function createDesktopFile(templatePath: string, dir: string, baseName: string, options: Record<string, unknown>): Promise<void>;
export function createTemplatedFile(templatePath: string, dest: string, options: Record<string, unknown>, filePermissions?: number): Promise<void>;
export function errorMessage(message: string, err: Error): string;
export function generateTemplate(templatePath: string, data: Record<string, unknown>): Promise<string>;
export function getATSPIDepends(version: string, dependencyMap: DependencyMap): string[];
export function getDRMDepends(version: string, dependencyMap: DependencyMap): string[];
export function getDefaultsFromPackageJSON(pkg: PackageJSON, fallbacks?: Pick<Configuration, 'revision'>): Configuration;
export function getDepends(version: string, dependencyMap: DependencyMap): string[];
export function getGBMDepends(version: string, dependencyMap: DependencyMap): string[];
export function getGConfDepends(version: string, dependencyMap: DependencyMap): string[];
export function getGTKDepends(version: string, dependencyMap: DependencyMap): string[];
export function getTrashDepends(version: string, dependencyMap: DependencyMap): string[];
export function getUUIDDepends(version: string, dependencyMap: DependencyMap): string[];
export function getXcbDri3Depends(version: string, dependencyMap: DependencyMap): string[];
export function getXssDepends(version: string, dependencyMap: DependencyMap): string[];
export function hasSandboxHelper(appDir: string): boolean;
export function mergeUserSpecified(data: Record<string, unknown>, dependencyKey: string, defaults: Record<string, unknown>): Record<string, unknown>;
export function readElectronVersion(appDir: string): Promise<string>;
export function readMetadata(options: ReadMetadataOptions): Promise<PackageJSON>;
export function replaceScopeName(name?: string, divider?: string): string;
export function sanitizeName(name: string, allowedCharacterRange: string, replacement?: string): string;
export function updateSandboxHelperPermissions(appDir: string): Promise<void>;
export function wrapError(message: string): CatchableFunction;
export function wrapError(message: string, wrappedFunction: () => Promise<void>): Promise<void>;
