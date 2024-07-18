"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __asyncValues = (this && this.__asyncValues) || function (o) {
    if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
    var m = o[Symbol.asyncIterator], i;
    return m ? m.call(o) : (o = typeof __values === "function" ? __values(o) : o[Symbol.iterator](), i = {}, verb("next"), verb("throw"), verb("return"), i[Symbol.asyncIterator] = function () { return this; }, i);
    function verb(n) { i[n] = o[n] && function (v) { return new Promise(function (resolve, reject) { v = o[n](v), settle(resolve, reject, v.done, v.value); }); }; }
    function settle(resolve, reject, d, v) { Promise.resolve(v).then(function(v) { resolve({ value: v, done: d }); }, reject); }
};
Object.defineProperty(exports, "__esModule", { value: true });
const obsidian_1 = require("obsidian");
class GTDAdmin extends obsidian_1.Plugin {
    createGtdStructure() {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, e_1, _b, _c, _d, e_2, _e, _f;
            const vault = this.app.vault;
            const basePath = 'GTD';
            const folders = [
                basePath,
                `${basePath}/1. Proyects`,
                `${basePath}/2. Stay`,
                `${basePath}/3. Someday`,
                `${basePath}/4. archive`
            ];
            const files = [
                { name: `${basePath}/Inbox.md`, data: '' },
                { name: `${basePath}/Documentation.md`, data: '' },
                { name: `${basePath}/Follow.md`, data: '' }
            ];
            try {
                for (var _g = true, folders_1 = __asyncValues(folders), folders_1_1; folders_1_1 = yield folders_1.next(), _a = folders_1_1.done, !_a; _g = true) {
                    _c = folders_1_1.value;
                    _g = false;
                    const folder = _c;
                    try {
                        yield vault.createFolder(folder);
                    }
                    catch (e) {
                        console.log(`Folder ${folder} already exists.`);
                    }
                }
            }
            catch (e_1_1) { e_1 = { error: e_1_1 }; }
            finally {
                try {
                    if (!_g && !_a && (_b = folders_1.return)) yield _b.call(folders_1);
                }
                finally { if (e_1) throw e_1.error; }
            }
            try {
                for (var _h = true, files_1 = __asyncValues(files), files_1_1; files_1_1 = yield files_1.next(), _d = files_1_1.done, !_d; _h = true) {
                    _f = files_1_1.value;
                    _h = false;
                    const file = _f;
                    const { name, data } = file;
                    try {
                        yield vault.create(`${name}`, `${data}`);
                    }
                    catch (e) {
                        console.log(`File file already exists.`);
                    }
                }
            }
            catch (e_2_1) { e_2 = { error: e_2_1 }; }
            finally {
                try {
                    if (!_h && !_d && (_e = files_1.return)) yield _e.call(files_1);
                }
                finally { if (e_2) throw e_2.error; }
            }
            new obsidian_1.Notice('GTD structure created!');
        });
    }
    onload() {
        return __awaiter(this, void 0, void 0, function* () {
            this.addCommand({
                id: "Create_Gtd_Structure",
                name: "Create Gtd Structure",
                callback: () => this.createGtdStructure()
            });
        });
    }
    onunload() {
        new obsidian_1.Notice('GTDAdmin was disabled');
    }
}
exports.default = GTDAdmin;
