import Room from "./room";
import * as mysql from "mysql2";
export declare type SQLUpdateRoom = (roomid: number, roomstate: string) => Promise<void>;
export default class Hub {
    rooms: Room[];
    roomid: number;
    constructor();
    addNewRoom(roomid: number): Room;
    addRoom(room: Room): void;
    getRoom(id: number): Room | undefined;
    getNextFreeRoom(): number;
    whereIs(playerid: number): number | null;
    saveRoom(roomid: number, update: SQLUpdateRoom): Promise<void>;
    saveRooms(update: SQLUpdateRoom): Promise<void>;
    init(db: mysql.Pool): Promise<void>;
}
