import Room, { RoomMode } from "./room";
import queries from "./queries";

import * as mysql from "mysql2";
import { isGeneratorFunction } from "util/types";
import {
  existsLanguage,
  existsScore,
  existsWinCondition,
} from "../shiri_common/base";

type dbRoomPacket = {
  roomid: string;
  gamestate: string | null;
  maxplayers: string;
  lang: string | null;
  creator: string;
  wincondition: string;
  scoring: string;
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
  getNextFreeRoom() {
    for (let i = 1; true; i++) {
      if (!this.getRoom(i) || this.getRoom(i)?.finished) return i;
    }
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
        const dic = existsLanguage(lang) ? lang : 0;
        const creator = parseInt(e.creator || "1", 10);
        const parsedData = Room.parseState(e.gamestate || "");
        const points = new Map(parsedData[1]);
        const wc = parseInt(e.wincondition, 10);
        const sc = parseInt(e.scoring, 10);
        const mode: RoomMode = {
          WinCondition: existsWinCondition(wc) ? wc : 0,
          Score: existsScore(sc) ? sc : 0,
        };
        this.addRoom(
          new Room(
            roomid,
            undefined,
            parsedData[2],
            parsedData[0],
            maxplayers,
            points,
            dic,
            creator,
            mode
          )
        );
      });
    }
    this.rooms.forEach((e) => e.clearBadPlayers());
  }
}
