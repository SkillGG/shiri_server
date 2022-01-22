"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getLanguage = exports.getLangList = void 0;
const english_1 = require("./english");
const polish_1 = require("./polish");
const langList = [];
const getLangList = () => {
    return langList;
};
exports.getLangList = getLangList;
const getLanguage = (lang) => langList.find((l) => l.id === lang) || langList[0];
exports.getLanguage = getLanguage;
langList.push(english_1.English);
langList.push(polish_1.Polish);
