import { GameMode } from "./gamemodes";
export declare type PlayerID = Exclude<number, 0>;
export declare type Reason = "notInDic" | "alreadyIn" | "wrongStart" | "wordError" | undefined;
declare type InOutEvent = {
    data: {
        type: "leave" | "join";
        playerid: number;
    };
};
declare type PointEvent = {
    data: {
        type: "points";
        playerid: number;
        points: number;
        reason?: Reason;
        word?: string;
    };
};
declare type InputEvent = {
    data: {
        type: "input";
        playerid: number;
        word: string;
    };
};
declare type CheckEvent = {
    data: {
        type: "check";
        playerid: number;
    };
};
export declare type WinConditionIDs = 0 | 1;
export declare type ScoreIDs = 0 | 1 | 2;
export declare type LangIDs = 0 | 1;
export declare type NewRoomData = {
    WinCondition: WinConditionIDs;
    Score: ScoreIDs;
    MaxPlayers: number;
    Dictionary: LangIDs;
};
export declare const existsScore: (n: number) => n is ScoreIDs;
export declare const existsWinCondition: (n: number) => n is WinConditionIDs;
export declare const existsLanguage: (n: number) => n is LangIDs;
export declare type SendEvent = (CheckEvent | InOutEvent | PointEvent | InputEvent) & {
    time: number;
};
export declare type Word = {
    /**
     * Player ID
     */
    playerid: number;
    /**
     * Time, the word was sent
     */
    time: number;
    /**
     * Text of the word
     */
    word: string;
};
export declare type Room = {
    /**
     * How room is sored in the database
     */
    state: string;
    /**
     * Array of IDs of players currently in the room
     */
    currplayers: number[];
    /**
     * ID of the player who created/is the owner of the room
     */
    creator: number;
    /**
     * Room's various rules
     */
    gamemode?: GameMode;
    /**
     * Room's gamemode data
     */
    creationdata: NewRoomData;
};
/**
 * List of points of each player
 */
export declare type Points = Map<Exclude<number, 0>, Exclude<number, 0>>;
export {};
