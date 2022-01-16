"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.existsLanguage = exports.existsWinCondition = exports.existsScore = void 0;
const existsScore = (n) => n === 0 || n === 1 || n === 2;
exports.existsScore = existsScore;
const existsWinCondition = (n) => n === 0 || n === 1;
exports.existsWinCondition = existsWinCondition;
const existsLanguage = (n) => n === 0 || n === 1;
exports.existsLanguage = existsLanguage;
