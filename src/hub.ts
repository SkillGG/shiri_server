import Room from "./room";
import queries from "./queries";

import * as mysql from "mysql2";

type dbRoomPacket = {
  roomid: string;
  gamestate: string | null;
  maxplayers: string;
  lang: string | null;
  creator: string;
} & mysql.OkPacket;

export type SQLUpdateRoom = (
  roomid: number,
  roomstate: string
) => Promise<void>;

export default class Hub {
  rooms: Room[];
  roomid: number;
  constructor() {
    this.rooms = [];
    this.roomid = 0;
  }
  addNewRoom(roomid: number) {
    const newRoomId = roomid || this.roomid++;
    let newRoom = new Room(newRoomId);
    this.rooms.push(newRoom);
    return newRoom;
  }
  addRoom(room: Room) {
    const gotRoom = this.getRoom(room.id);
    if (gotRoom) {
      console.log(
        "room already exists",
        this.rooms[this.rooms.indexOf(gotRoom)]
      );
      this.rooms[this.rooms.indexOf(gotRoom)] = room;
      return;
    } else {
      console.log("New room");
      this.rooms.push(room);
    }
  }
  getRoom(id: number): Room | undefined {
    return this.rooms.find((r) => r.id === id);
  }
  whereIs(playerid: number) {
    if (!playerid) return null;
    const foundRoom = this.rooms.find((room) => {
      return room.players.has(playerid);
    });
    if (foundRoom) return foundRoom.id;
    else return null;
  }

  async saveRoom(roomid: number, update: SQLUpdateRoom) {
    const room = this.rooms.find((room) => room.id === roomid);
    if (room) {
      await update(room.id, room.getState());
    }
  }

  async saveRooms(update: SQLUpdateRoom) {
    for (const room of this.rooms) {
      await update(room.id, room.getState());
    }
  }

  async init(db: mysql.Pool) {
    let dbPromise = db.promise();
    const [rows] = await dbPromise.execute<dbRoomPacket[]>(queries.getRoomList);
    if (rows && Array.isArray(rows)) {
      rows.forEach((e) => {
        const roomid = parseInt(e.roomid);
        const maxplayers = parseInt(e.maxplayers || "10", 10);
        const lang = parseInt(e.lang || "0", 10);
        const creator = parseInt(e.creator || "1", 10);
        const parsedData = Room.parseState(e.gamestate || "");
        const points = new Map(parsedData[1]);
        this.addRoom(
          new Room(
            roomid,
            undefined,
            parsedData[2],
            parsedData[0],
            maxplayers,
            points,
            lang,
            creator
          )
        );
      });
    }
    this.rooms.forEach((e) => e.clearBadPlayers());
  }
}
