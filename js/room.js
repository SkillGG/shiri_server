"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const word_1 = __importDefault(require("./word"));
const events_1 = __importDefault(require("events"));
class Room {
    constructor(id, players = new Set(), words = [], finished = false, maxPlayers = 4, pts = new Map(), lang = 0, creator = 1) {
        Object.defineProperty(this, "players", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "words", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "points", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "id", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "finished", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "maxPlayers", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "language", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "creator", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "eventEmitter", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "evID", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        this.players = players;
        this.words = words;
        this.points = pts;
        this.finished = finished;
        this.id = id;
        this.eventEmitter = new events_1.default();
        this.maxPlayers = maxPlayers;
        this.language = lang;
        this.creator = creator;
        this.evID = 0;
    }
    eventID() {
        return this.evID++;
    }
    shiriCheck(word) {
        if (this.words.length < 1)
            return true;
        const last = this.words[this.words.length - 1];
        console.log("last", last);
        if (!last.word)
            return true;
        if (last.word.charAt(last.word.length - 1) === word.word.charAt(0))
            return true;
        return false;
    }
    shallowCorrect(word) {
        return word.shallowCorrect(this.language);
    }
    checkDictionary(word) {
        return word.deepCorrect(this.language);
    }
    clearBadPlayers() {
        if (this.players.has(NaN))
            this.players.delete(NaN);
    }
    addPoints(id, num) {
        if (!id)
            return;
        console.log("Point manip", id, num, this.points);
        if (num < 0)
            this.points.set(id, (this.points.get(id) || 0) - num);
        this.clearBadPlayers();
    }
    checkForWord(word) {
        this.clearBadPlayers();
        for (let i = 0; i < this.words.length; i++) {
            if (word.word === this.words[i].word)
                return true;
        }
        return false;
    }
    getNumberOfPlayersLoggedIn() {
        return this.players.size;
    }
    addPlayer(id) {
        if (this.players.size >= this.maxPlayers)
            return false;
        else {
            if (!id)
                return false;
            this.players.add(id);
            if (!this.points.has(id)) {
                this.points.set(id, 0);
            }
            return true;
        }
    }
    removePlayer(id) {
        this.players.delete(id);
        return !this.players.has(id);
    }
    registerWord(playerid, str, time) {
        this.clearBadPlayers();
        if (playerid && str) {
            this.words.push(new word_1.default(playerid, str, time));
        }
    }
    getState() {
        const worddata = this.words.reduce((prev, data) => {
            return prev + data.getStatus();
        }, "");
        const pointdata = [...this.points].reduce((prev, next) => {
            return prev + (next[1] > 0 ? `${next[0]}${"-".repeat(next[1])}` : "");
        }, "");
        return `${worddata || ""}${pointdata}${this.finished ? "~" : ""}`;
    }
    static parseState(state) {
        /**
         * TODO: reTS this
         */
        const words = [];
        const finished = !!/.*~$/.exec(state);
        const points = [];
        let ptsregx = state.matchAll(/(?<id>\d+)(?<pts>\-+)/gi);
        for (const rgp of ptsregx) {
            if (rgp.groups) {
                const { id, pts } = rgp.groups;
                points.push([parseInt(id, 10), pts.length]);
            }
        }
        let regx = state.matchAll(/(?<player>\d+?)(?<word>[a-ząćęółńśżź]+)(?<time>\d+?);/gi);
        for (const nxt of regx) {
            if (nxt.groups) {
                const { player, word, time } = nxt.groups;
                words.push(new word_1.default(parseInt(player, 10), word, parseInt(time, 10)));
            }
        }
        return [finished, points, words];
    }
    static emitEvent(event, room) {
        room.eventEmitter.emit("event", event);
    }
}
exports.default = Room;
