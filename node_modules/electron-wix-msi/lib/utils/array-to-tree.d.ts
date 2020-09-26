import { File, FileFolderTree, Registry } from '../interfaces';
export declare function isDirectChild(parent: string, possibleChild: string): boolean;
export declare function isChild(parent: string, possibleChild: string): boolean;
export declare function arrayToTree(input: Array<string>, root: string, appVersion?: string): FileFolderTree;
export declare function addFilesToTree(tree: FileFolderTree, files: Array<string>, specialFiles: Array<File>, registry: Array<Registry>, appVersion: string): FileFolderTree;
