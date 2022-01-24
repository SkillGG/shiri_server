/// <reference types="node" />
import Word from "./word";
export declare type ParsedRoomData = [boolean, [number, number][], Word[]];
import { SendEvent, NewRoomData, LangIDs, PlayerID } from "../shiri_common/base";
import { GameMode } from "../shiri_common/gamemodes";
import EventEmitter from "events";
export declare type RoomMode = Pick<NewRoomData, "WinCondition" | "Score">;
export declare type SendCallback = (data: SendEvent) => void;
export declare type EventData = [SendEvent];
export default class Room {
    players: Set<PlayerID>;
    words: Word[];
    points: Map<PlayerID, number>;
    id: number;
    finished: boolean;
    maxPlayers: number;
    language: LangIDs;
    creator: PlayerID;
    eventEmitter: EventEmitter;
    evID: number;
    mode: RoomMode;
    constructor(id: number, players?: Set<number>, words?: Word[], finished?: boolean, maxPlayers?: number, pts?: Map<number, number>, lang?: LangIDs, creator?: number, mode?: RoomMode);
    isWin(): PlayerID | false;
    eventID(): number;
    getGamemode(): GameMode;
    shiriCheck(word: Word): boolean;
    shallowCorrect(word: Word): boolean;
    checkDictionary(word: Word): boolean;
    clearBadPlayers(): void;
    addPoints(id: number, num: number): void;
    countPoints(): Map<number, number>;
    checkForWord(word: Word): boolean;
    getNumberOfPlayersLoggedIn(): number;
    addPlayer(id: number): {
        done: boolean;
        error?: undefined;
    } | {
        done: boolean;
        error: string;
    };
    removePlayer(id: number): boolean;
    registerWord(playerid: number, str: string, time: number): void;
    getState(): string;
    static parseState(state: string): ParsedRoomData;
    static emitEvent(event: SendEvent, room: Room): void;
}
