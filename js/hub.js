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
    addNewRoom(roomid) {
        const newRoomId = roomid || this.roomid++;
        let newRoom = new room_1.default(newRoomId);
        this.rooms.push(newRoom);
        return newRoom;
    }
    addRoom(room) {
        const gotRoom = this.getRoom(room.id);
        if (gotRoom) {
            console.log("room already exists", this.rooms[this.rooms.indexOf(gotRoom)]);
            this.rooms[this.rooms.indexOf(gotRoom)] = room;
            return;
        }
        else {
            console.log("New room");
            this.rooms.push(room);
        }
    }
    getRoom(id) {
        return this.rooms.find((r) => r.id === id);
    }
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
            const [rows] = yield dbPromise.execute(queries_1.default.getRoomList);
            if (rows && Array.isArray(rows)) {
                rows.forEach((e) => {
                    const roomid = parseInt(e.roomid);
                    const maxplayers = parseInt(e.maxplayers || "10", 10);
                    const lang = parseInt(e.lang || "0", 10);
                    const creator = parseInt(e.creator || "1", 10);
                    const parsedData = room_1.default.parseState(e.gamestate || "");
                    const points = new Map(parsedData[1]);
                    this.addRoom(new room_1.default(roomid, undefined, parsedData[2], parsedData[0], maxplayers, points, lang, creator));
                });
            }
            this.rooms.forEach((e) => e.clearBadPlayers());
        });
    }
}
exports.default = Hub;
