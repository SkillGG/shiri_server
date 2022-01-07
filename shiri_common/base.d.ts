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
export declare type SendEvent = (InOutEvent | PointEvent | InputEvent) & {
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
     * Room's dictionary
     */
    language: number;
    /**
     * ID of the player who created/is the owner of the room
     */
    creator: number;
    /**
     * Room's various rules
     */
    gamemode?: GameMode;
    /**
     * Room's gamemode id
     */
    modeid: number;
};
/**
 * List of points of each player
 */
export declare type Points = Map<Exclude<number, 0>, Exclude<number, 0>>;
export {};
