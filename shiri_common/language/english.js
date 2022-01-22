"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.English = void 0;
const tslib_1 = require("tslib");
const react_1 = (0, tslib_1.__importDefault)(require("react"));
const gamemodes_1 = require("../gamemodes");
const definitions_1 = require("./definitions");
exports.English = {
    CODE: "EN",
    id: 0,
    you: "You",
    next: "Next",
    login: "Login",
    newRoom: "New Room",
    name: "Name",
    word: "Word",
    inputUsername: "Input Username: ",
    register: "Register",
    wrongPass: "Wrong PIN!",
    players: "Players",
    max: "Max",
    pinInfo: react_1.default.createElement("span", null, "PIN should consist of six digits."),
    unknownReason: "For unknown reason",
    passTooShort: "Your PIN is too short",
    badWord: {
        wrongStart: {
            raw: "Word starts wrongly",
            fill: ({ value }) => `The word should start at ${value.toLocaleUpperCase()}`,
        },
        alreadyIn: "Word has been already used!",
        wordError: "Incorrect word",
        notInDic: {
            raw: "Word not in dictionary!",
            fill: ({ value }) => `Word ${value} is not in dictionary`,
        },
    },
    inputPINFor: {
        raw: "Input PIN: ",
        fill: ({ value }) => `Input PIN for ${value}: `,
        xfill: (0, definitions_1.UserBackXFill)("Insert PIN for", "goBack"),
    },
    loggedAs: {
        raw: "Logged in",
        fill: ({ value }) => `Logged in as ${value}:`,
        xfill: (0, definitions_1.UserBackXFill)("Logged in as", "logout"),
    },
    joinedRoom: {
        raw: "Joined room:",
        fill: ({ value }) => `Joined to room #${value}`,
        xfill: ({ value, lang, mode = gamemodes_1.defaultGameMode, sdesc, wdesc, onClick, }) => (react_1.default.createElement("div", null,
            "Joined room #",
            value,
            "[",
            lang,
            "]",
            mode && (react_1.default.createElement(react_1.default.Fragment, null,
                react_1.default.createElement("br", null),
                react_1.default.createElement("span", { title: sdesc },
                    "Mode: ",
                    mode.scoring.id),
                "/",
                react_1.default.createElement("span", { title: wdesc }, mode.wincondition.id))),
            react_1.default.createElement("br", null),
            react_1.default.createElement("span", { className: "goBack", onClick: onClick }, "Leave"))),
    },
    defaultScoreDescription: "Each Word +1 Point",
    defaultWinDescription: "Endless Mode",
    scoreDescriptions: [
        {
            id: "+1over4",
            description: "Additional points for every letter over 4",
        },
        {
            id: "length",
            description: "Every letter is worth one point",
        },
    ],
    winDescriptions: [],
};
