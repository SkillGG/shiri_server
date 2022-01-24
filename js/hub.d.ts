import Room from "./room";
import * as mysql from "mysql2";
export declare type SQLUpdateRoom = (roomid: number, roomstate: string) => Promise<void>;
export default class Hub {
    rooms: Room[];
    roomid: number;
    constructor();
    /**
     *
     * @param roomid id of a new room
     * @returns A new Room created with default settings and id
     */
    addNewRoom(roomid: number): Room;
    /**
     *
     * @param room Room to add
     */
    addRoom(room: Room): void;
    /**
     * @returns Room with given ID or undefined if given doesn't exist
     */
    getRoom(id: number): Room | undefined;
    /**
     *
     * @returns {number} ID of a free room
     */
    getNextFreeRoom(): number;
    /**
     *
     * @param playerid ID of a player
     * @returns ID of a room that player is currently in
     */
    whereIs(playerid: number): number | null;
    saveRoom(roomid: number, update: SQLUpdateRoom): Promise<void>;
    saveRooms(update: SQLUpdateRoom): Promise<void>;
    init(db: mysql.Pool): Promise<void>;
}
