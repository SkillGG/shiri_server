/// <reference types="react" />
import { GameMode } from "../gamemodes";
import { InjectableField, XFillOnClick } from "./definitions";
export declare const getLangList: () => Readonly<Language[]>;
export declare const getLanguage: (lang: number) => Language;
export declare type ModeDesctiption<T extends string> = {
    description: string;
    id: T;
};
export declare type Language = {
    CODE: "EN" | "PL";
    id: number;
    notyetimplemented: string;
    next: string;
    you: string;
    newRoom: string;
    login: string;
    inputUsername: string;
    register: string;
    players: string;
    max: string;
    inputPINFor: XFillOnClick<{
        value: string;
    }>;
    loggedAs: XFillOnClick<{
        value: string;
    }>;
    wrongPass: string;
    joinedRoom: XFillOnClick<{
        value: string;
        lang: string;
        sdesc: string;
        wdesc: string;
        mode: GameMode;
    }>;
    createRoom: {
        maxplayers: string;
        dictionary: string;
        scoring: {
            fieldsetlegend: string;
            id0: string;
            id1: string;
            id2: string;
            id101: string;
            id101_title: string;
        };
        wincond: {
            timed: string;
            endless: string;
            id1: string;
            fieldsetlegend: string;
        };
        createBtn: string;
    };
    pinInfo: JSX.Element;
    unknownReason: string;
    name: string;
    word: string;
    passTooShort: string;
    badWord: {
        wrongStart: InjectableField<{
            value: string;
        }>;
        alreadyIn: string;
        wordError: string;
        notInDic: InjectableField<{
            value: string;
        }>;
    };
    defaultScoreDescription: string;
    defaultWinDescription: string;
    scoreDescriptions: [
        ModeDesctiption<"+1over4">,
        ModeDesctiption<"length">,
        ModeDesctiption<"+1over4_safe">
    ];
    winDescriptions: [ModeDesctiption<"overN">];
};
