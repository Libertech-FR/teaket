import { ExtensionFileV1, ExtensionsListV1 } from './_dto/extension.dto';
import { DynamicModule } from '@nestjs/common';
export declare const EXTENSION_FILE_INFO = "extension.yml";
export declare const EXTENSIONS_FILE_PATH: string;
export declare function parseExtensionsList(): Promise<ExtensionsListV1[]>;
export declare function extensionParseFile(path: string): Promise<ExtensionFileV1>;
export default function (): Promise<DynamicModule[]>;
