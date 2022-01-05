"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const wordRegex = [/^[a-z]+$/i, /^[a-ząćęłóśźż]+$/i];
const wordlist_1 = __importDefault(require("./wordlist"));
class Word {
    constructor(player, str, time) {
        Object.defineProperty(this, "playerid", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "word", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "time", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        this.playerid = player;
        this.word = str;
        this.time = time || new Date().getTime();
    }
    getStatus() {
        return `${this.playerid}${this.word}${this.time};`;
    }
    shallowCorrect(lang) {
        return !!wordRegex[lang || 0].exec(this.word);
    }
    deepCorrect(lang) {
        if (!wordlist_1.default.ready)
            return console.error("Not ready yet!"), false;
        return wordlist_1.default[lang || 0].has(this.word.toLowerCase());
    }
}
exports.default = Word;
