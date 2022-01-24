import Room, { RoomMode } from "./room";
import queries from "./queries";

import * as mysql from "mysql2";
import {
  existsLanguage,
  existsScore,
  existsWinCondition,
  WinConditionData,
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
  /**
   *
   * @param roomid id of a new room
   * @returns A new Room created with default settings and id
   */
  addNewRoom(roomid: number) {
    const newRoomId = roomid || this.roomid++;
    let newRoom = new Room(newRoomId);
    this.rooms.push(newRoom);
    return newRoom;
  }
  /**
   *
   * @param room Room to add
   */
  addRoom(room: Room) {
    const gotRoom = this.getRoom(room.id);
    if (gotRoom) {
      this.rooms[this.rooms.indexOf(gotRoom)] = room;
      return;
    } else {
      console.log("New room", room.id);
      this.rooms.push(room);
    }
  }
  /**
   * @returns Room with given ID or undefined if given doesn't exist
   */
  getRoom(id: number): Room | undefined {
    return this.rooms.find((r) => r.id === id);
  }
  /**
   *
   * @returns {number} ID of a free room
   */
  getNextFreeRoom() {
    for (let i = 1; true; i++) {
      if (!this.getRoom(i) || this.getRoom(i)?.finished) return i;
    }
  }
  /**
   *
   * @param playerid ID of a player
   * @returns ID of a room that player is currently in
   */
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
    // get room list
    const [rows] = await dbPromise.execute<dbRoomPacket[]>(queries.getRoomList);
    if (rows && Array.isArray(rows)) {
      // for each room
      rows.forEach((e) => {
        // parse database data
        const roomid = parseInt(e.roomid);

        const oldroom = this.getRoom(roomid);
        let players;
        if (oldroom) players = oldroom.players;

        const maxplayers = parseInt(e.maxplayers || "10", 10);
        const lang = parseInt(e.lang || "0", 10);
        const dic = existsLanguage(lang) ? lang : 0;
        const creator = parseInt(e.creator || "1", 10);

        const parsedData = Room.parseState(e.gamestate || "");
        const points = new Map(parsedData[1]);
        const words = parsedData[2];
        const finished = parsedData[0];

        const wincond = e.wincondition.split("/");
        const wc = parseInt(wincond[0], 10);
        const wcdata: WinConditionData = wincond[1]
          ? JSON.parse(wincond[1])
          : {};
        const sc = parseInt(e.scoring, 10);
        const mode: RoomMode = {
          WinCondition: { id: existsWinCondition(wc) ? wc : 0, data: wcdata },
          Score: { id: existsScore(sc) ? sc : 0 },
        };

        const newroom = new Room(
          roomid,
          players,
          words,
          finished,
          maxplayers,
          points,
          dic,
          creator,
          mode
        );
        // fix throwing out players after refresh
        if (oldroom) {
          newroom.evID = oldroom.evID;
          newroom.eventEmitter = oldroom.eventEmitter;
        }
        this.addRoom(newroom);
      });
    }
    // clear all NaN players
    this.rooms.forEach((e) => e.clearBadPlayers());
  }
}
