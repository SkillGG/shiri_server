"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const room_1 = __importDefault(require("./room"));
const queries_1 = __importDefault(require("./queries"));
const base_1 = require("../shiri_common/base");
class Hub {
    constructor() {
        Object.defineProperty(this, "rooms", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "roomid", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        this.rooms = [];
        this.roomid = 0;
    }
    /**
     *
     * @param roomid id of a new room
     * @returns A new Room created with default settings and id
     */
    addNewRoom(roomid) {
        const newRoomId = roomid || this.roomid++;
        let newRoom = new room_1.default(newRoomId);
        this.rooms.push(newRoom);
        return newRoom;
    }
    /**
     *
     * @param room Room to add
     */
    addRoom(room) {
        const gotRoom = this.getRoom(room.id);
        if (gotRoom) {
            this.rooms[this.rooms.indexOf(gotRoom)] = room;
            return;
        }
        else {
            console.log("New room", room.id);
            this.rooms.push(room);
        }
    }
    /**
     * @returns Room with given ID or undefined if given doesn't exist
     */
    getRoom(id) {
        return this.rooms.find((r) => r.id === id);
    }
    /**
     *
     * @returns {number} ID of a free room
     */
    getNextFreeRoom() {
        var _a;
        for (let i = 1; true; i++) {
            if (!this.getRoom(i) || ((_a = this.getRoom(i)) === null || _a === void 0 ? void 0 : _a.finished))
                return i;
        }
    }
    /**
     *
     * @param playerid ID of a player
     * @returns ID of a room that player is currently in
     */
    whereIs(playerid) {
        if (!playerid)
            return null;
        const foundRoom = this.rooms.find((room) => {
            return room.players.has(playerid);
        });
        if (foundRoom)
            return foundRoom.id;
        else
            return null;
    }
    saveRoom(roomid, update) {
        return __awaiter(this, void 0, void 0, function* () {
            const room = this.rooms.find((room) => room.id === roomid);
            if (room) {
                yield update(room.id, room.getState());
            }
        });
    }
    saveRooms(update) {
        return __awaiter(this, void 0, void 0, function* () {
            for (const room of this.rooms) {
                yield update(room.id, room.getState());
            }
        });
    }
    init(db) {
        return __awaiter(this, void 0, void 0, function* () {
            let dbPromise = db.promise();
            // get room list
            const [rows] = yield dbPromise.execute(queries_1.default.getRoomList);
            if (rows && Array.isArray(rows)) {
                // for each room
                rows.forEach((e) => {
                    // parse database data
                    const roomid = parseInt(e.roomid);
                    const oldroom = this.getRoom(roomid);
                    let players;
                    if (oldroom)
                        players = oldroom.players;
                    const maxplayers = parseInt(e.maxplayers || "10", 10);
                    const lang = parseInt(e.lang || "0", 10);
                    const dic = (0, base_1.existsLanguage)(lang) ? lang : 0;
                    const creator = parseInt(e.creator || "1", 10);
                    const parsedData = room_1.default.parseState(e.gamestate || "");
                    const points = new Map(parsedData[1]);
                    const words = parsedData[2];
                    const finished = parsedData[0];
                    const wincond = e.wincondition.split("/");
                    const wc = parseInt(wincond[0], 10);
                    const wcdata = wincond[1]
                        ? JSON.parse(wincond[1])
                        : {};
                    const scoring = e.scoring.split("/");
                    const sc = parseInt(scoring[0], 10);
                    const scdata = scoring[1] ? JSON.parse(scoring[1]) : {};
                    const mode = {
                        WinCondition: { id: (0, base_1.existsWinCondition)(wc) ? wc : 0, data: wcdata },
                        Score: { id: (0, base_1.existsScore)(sc) ? sc : 0, data: scdata },
                    };
                    const newroom = new room_1.default(roomid, players, words, finished, maxplayers, points, dic, creator, mode);
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
        });
    }
}
exports.default = Hub;
