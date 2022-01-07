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
export declare const defaultGameMode: NNGameMode;
export declare const gmToNN: (gm?: GameMode) => NNGameMode;
export interface NNGameMode extends GameMode {
    wordToPts(word: Word): number;
    onWordCame(word: Word, refs?: GameRoomRefs): void;
    onPtsCame(points: {
        pts: number;
        playerid: Exclude<number, 0>;
    }, room: Room, refs?: GameRoomRefs): void;
    isWin(room: Room, players: Points): false | PlayerID;
    wordCSSClass: (w: Word) => string;
}
export interface GameMode {
    id: number;
    description: Exclude<string, "">;
    wordToPts?(word: Word): number;
    onWordCame?(word: Word, refs?: GameRoomRefs): void;
    onPtsCame?(points: {
        pts: number;
        playerid: Exclude<number, 0>;
    }, room: Room, refs?: GameRoomRefs): void;
    isWin?(room: Room, players: Points): false | PlayerID;
    wordCSSClass?: (w: Word) => string;
}
export declare const errTimeout = 2000;
export declare const GameModes: GameMode[];
