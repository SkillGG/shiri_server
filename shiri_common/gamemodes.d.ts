import React from "react";
import { Word, Room, Points, PlayerID } from "./base";
export interface PlayerPointsRef {
    [key: number]: HTMLSpanElement;
}
export declare type PointStateSetter = React.Dispatch<React.SetStateAction<Map<number, number>>>;
export interface GameRoomRefs {
    textInput: React.RefObject<HTMLInputElement>;
    wordList: React.RefObject<HTMLDivElement>;
    playerList: {
        elements: React.RefObject<PlayerPointsRef>;
        list: React.RefObject<HTMLDivElement>;
        addPointState: PointStateSetter;
    };
}
export interface ModeInfo {
    description: string;
    id: number;
}
export interface Scoring extends ModeInfo {
    wordToPts(word: Word): number;
    onWordCame(word: Word, refs?: GameRoomRefs): void;
    onPtsCame(points: {
        pts: number;
        playerid: Exclude<number, 0>;
    }, room: Room, refs?: GameRoomRefs): void;
    wordCSSClass: (w: Word) => string;
}
export interface WinCondition extends ModeInfo {
    isWin(room: Room, players: Points): false | PlayerID;
}
export interface GameMode {
    scoring: Scoring;
    wincondition: WinCondition;
}
export declare const defaultScoring: Scoring;
export declare const defaultWinCondition: WinCondition;
export declare const defaultGameMode: GameMode;
export declare const errTimeout = 2000;
export declare const ScoringSystems: Scoring[];
export declare const WinConditions: WinCondition[];
