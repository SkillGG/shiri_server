"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Polish = void 0;
const tslib_1 = require("tslib");
const react_1 = (0, tslib_1.__importDefault)(require("react"));
const definitions_1 = require("./definitions");
exports.Polish = {
    CODE: "PL",
    id: 1,
    next: "Dalej",
    you: "Ty",
    login: "Zaloguj",
    newRoom: "Nowy Pokój",
    register: "Zarejestruj",
    name: "Gracz",
    word: "Słowo",
    inputUsername: "Podaj nazwę: ",
    wrongPass: "Zły PIN!",
    players: "Graczy",
    max: "Max",
    notyetimplemented: "Jeszcze nie zaimplementowano",
    createRoom: {
        maxplayers: "Max graczy:",
        createBtn: "Stwórz",
        dictionary: "Słownik:",
        scoring: {
            fieldsetlegend: "Punktacja",
            id0: "+1 za słowo",
            id1: "+1 za każdą literę powyżej 4",
            id101: "<5 Daje punkt",
            id101_title: "Jeżeli ktoś poda słowo krótsze niż 5 doda punkt zamiast odejmować",
            id2: "+1 za każdą literę w słowie",
        },
        wincond: {
            id1: "Dopóki:",
            fieldsetlegend: "Warunki zwycięstwa",
            endless: "Nieskończone",
            timed: "Na czas",
        },
    },
    pinInfo: react_1.default.createElement("span", null, "PIN powinien sk\u0142ada\u0107 si\u0119 z sze\u015Bciu cyfr."),
    unknownReason: "Z nieznanego powodu",
    passTooShort: "Twój PIN jest zbyt krótki",
    badWord: {
        alreadyIn: "Słowo już użyte!",
        wordError: "Niepoprawne słowo",
        wrongStart: {
            raw: "Słowo się źle zaczyna",
            fill: ({ value }) => `Słowo powinno zaczynać się na ${value
                .charAt(0)
                .toLocaleUpperCase()}`,
        },
        notInDic: {
            raw: "Słowa nie ma w słowniku",
            fill: ({ value }) => `Słowo ${value} nie jest w słowniku`,
        },
    },
    inputPINFor: {
        raw: "Podaj PIN: ",
        fill: ({ value }) => `Podaj PIN dla ${value}: `,
        xfill: (0, definitions_1.UserBackXFill)("Podaj PIN dla", "goBack"),
    },
    loggedAs: {
        raw: "Zalogowano",
        fill: ({ value }) => `Zalogowano jako ${value}:`,
        xfill: (0, definitions_1.UserBackXFill)("Zalogowano jako", "logout"),
    },
    joinedRoom: {
        raw: "W pokoju:",
        fill: ({ value }) => `W pokoju #${value}`,
        xfill: ({ value, lang, mode, sdesc, wdesc, onClick }) => (react_1.default.createElement("div", null,
            "W pokoju #",
            value,
            "[",
            lang,
            "]",
            mode && (react_1.default.createElement(react_1.default.Fragment, null,
                react_1.default.createElement("br", null),
                react_1.default.createElement("span", { title: sdesc },
                    "Tryb: ",
                    mode.scoring.id),
                "/",
                react_1.default.createElement("span", { title: wdesc }, mode.wincondition.id))),
            react_1.default.createElement("br", null),
            react_1.default.createElement("span", { className: "goBack", onClick: onClick }, "Wyjd\u017A"))),
    },
    defaultScoreDescription: "Każde słowo warte +1 punkt",
    defaultWinDescription: "Tryb nieskończony",
    winDescriptions: [
        { id: "overN", description: "Powyżej N punktów" },
    ],
    scoreDescriptions: [
        {
            id: "+1over4",
            description: "Dodatkowy punkt za każdą literę powyżej 4",
        },
        {
            id: "length",
            description: "Każda litera słowa jest równa 1 punkt",
        },
        {
            id: "+1over4_safe",
            description: "Dodatkowy punkt za każdą literę powyżej 4,\nsłowa poniżej 4 liczą się jako 1 punkt",
        },
    ],
};
