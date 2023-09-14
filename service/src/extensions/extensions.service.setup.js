"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.extensionParseFile = exports.parseExtensionsList = exports.EXTENSIONS_FILE_PATH = exports.EXTENSION_FILE_INFO = void 0;
const fs_1 = require("fs");
const path_1 = require("path");
const yaml_1 = require("yaml");
const extension_dto_1 = require("./_dto/extension.dto");
const class_transformer_1 = require("class-transformer");
const class_validator_1 = require("class-validator");
const process = __importStar(require("process"));
const common_1 = require("@nestjs/common");
const serviceList = [];
exports.EXTENSION_FILE_INFO = 'extension.yml';
exports.EXTENSIONS_FILE_PATH = (0, path_1.join)((0, path_1.dirname)(process.cwd()), '/extensions.yml');
function parseExtensionsList() {
    return __awaiter(this, void 0, void 0, function* () {
        const data = (0, fs_1.readFileSync)(exports.EXTENSIONS_FILE_PATH, 'utf8');
        const yml = (0, yaml_1.parse)(data);
        const schema = (0, class_transformer_1.plainToInstance)(extension_dto_1.ExtensionsFileV1, yml);
        try {
            yield (0, class_validator_1.validateOrReject)(schema, {
                whitelist: true,
            });
        }
        catch (errors) {
            const err = new Error(`Invalid extensions`);
            err.message = errors.map((e) => e.toString()).join(', '); //TODO: improve error message
            throw err;
        }
        return yml.list;
    });
}
exports.parseExtensionsList = parseExtensionsList;
function extensionParseFile(path) {
    return __awaiter(this, void 0, void 0, function* () {
        common_1.Logger.log('Extension file found, validating...', 'extensionParseFile');
        const data = (0, fs_1.readFileSync)(`${path}/${exports.EXTENSION_FILE_INFO}`, 'utf8');
        const yml = (0, yaml_1.parse)(data);
        return (0, class_transformer_1.plainToInstance)(extension_dto_1.ExtensionFileV1, yml);
    });
}
exports.extensionParseFile = extensionParseFile;
function default_1() {
    return __awaiter(this, void 0, void 0, function* () {
        var _a;
        try {
            if ((0, fs_1.existsSync)(exports.EXTENSIONS_FILE_PATH)) {
                common_1.Logger.log('Extensions file found, validating...', 'parsingAppExtensions');
                const list = yield parseExtensionsList();
                for (const extension of list) {
                    if (!extension.enabled) {
                        common_1.Logger.log(`Extension ${extension.path} is disabled`, 'ExtensionServiceSetup');
                        continue;
                    }
                    const extensionPath = `${(0, path_1.dirname)(process.cwd())}/${extension.path}`;
                    const extensionFile = yield extensionParseFile(extensionPath);
                    if (!extensionFile.settings.service.target)
                        continue;
                    const extensionServiceTarget = `${extensionPath}/${extensionFile.settings.service.target}`;
                    yield (_a = extensionServiceTarget, Promise.resolve().then(() => __importStar(require(_a)))).then((module) => {
                        if (module[extensionFile.settings.service.mainModule]) {
                            serviceList.push(module[extensionFile.settings.service.mainModule]);
                            return;
                        }
                        common_1.Logger.warn(`Extension ${extensionFile.information.name} has no main module`, 'ExtensionServiceSetup');
                    }).catch((err) => {
                        common_1.Logger.error(`Extension ${extensionFile.information.name} failed to load`, 'ExtensionServiceSetup');
                        console.error(err);
                    });
                }
            }
            return serviceList;
        }
        catch (err) {
            common_1.Logger.error('Failed to load extensions', 'ExtensionServiceSetup');
            console.error(err);
            process.exit(1);
        }
    });
}
exports.default = default_1;
