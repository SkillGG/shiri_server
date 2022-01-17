import Word from "./word";

export type ParsedRoomData = [boolean, [number, number][], Word[]];

import { SendEvent, NewRoomData, LangIDs } from "../shiri_common/base";
import {
  defaultGameMode,
  defaultScoring,
  defaultWinCondition,
  GameMode,
  ScoringSystems,
  WinConditions,
} from "../shiri_common/gamemodes";
import EventEmitter from "events";

export type RoomMode = Pick<NewRoomData, "WinCondition" | "Score">;

export type SendCallback = (data: SendEvent) => void;

export type EventData = [SendEvent];

export default class Room {
  players: Set<number>;
  words: Word[];
  points: Map<number, number>;
  id: number;
  finished: boolean;
  maxPlayers: number;
  language: LangIDs;
  creator: Exclude<number, 0>;
  eventEmitter: EventEmitter;
  evID: number;
  mode: RoomMode;
  constructor(
    id: number,
    players: Set<number> = new Set(),
    words: Word[] = [],
    finished: boolean = false,
    maxPlayers: number = 4,
    pts: Map<number, number> = new Map<number, number>(),
    lang: LangIDs = 0,
    creator: number = 1,
    mode: RoomMode = { Score: 0, WinCondition: 0 }
  ) {
    this.players = players;
    this.words = words;
    this.points = pts;
    this.finished = finished;
    this.id = id;
    this.eventEmitter = new EventEmitter();
    this.maxPlayers = maxPlayers;
    this.language = lang;
    this.creator = creator;
    this.evID = 0;
    this.mode = mode;
  }
  eventID(): number {
    return this.evID++;
  }
  getGamemode(): GameMode {
    return {
      scoring:
        ScoringSystems.find((g) => g.id === this.mode.Score) || defaultScoring,
      wincondition:
        WinConditions.find((w) => w.id === this.mode.WinCondition) ||
        defaultWinCondition,
    };
  }
  shiriCheck(word: Word) {
    if (this.words.length < 1) return true;
    const last = this.words[this.words.length - 1];
    console.log("last", last);
    if (!last.word) return true;
    if (last.word.charAt(last.word.length - 1) === word.word.charAt(0))
      return true;
    return false;
  }
  shallowCorrect(word: Word) {
    return word.shallowCorrect(this.language);
  }
  checkDictionary(word: Word) {
    return word.deepCorrect(this.language);
  }
  clearBadPlayers() {
    if (this.players.has(NaN)) this.players.delete(NaN);
  }
  addPoints(id: number, num: number) {
    if (!id) return;
    console.log("Point manip", id, num, this.points);
    if (num < 0) this.points.set(id, (this.points.get(id) || 0) - num);
    this.clearBadPlayers();
  }
  checkForWord(word: Word) {
    this.clearBadPlayers();
    for (let i = 0; i < this.words.length; i++) {
      if (word.word === this.words[i].word) return true;
    }
    return false;
  }
  getNumberOfPlayersLoggedIn() {
    return this.players.size;
  }
  addPlayer(id: number) {
    if (this.players.has(id)) return {done:true};
    if (this.players.size >= this.maxPlayers) return {done: false, error:"Too many players"};
    else {
      if (!id) return {done: false, error: "wrong id"};
      this.players.add(id);
      if (!this.points.has(id)) {
        this.points.set(id, 0);
      }
      return {done:true};
    }
  }
  removePlayer(id: number) {
    this.players.delete(id);
    return !this.players.has(id);
  }
  registerWord(playerid: number, str: string, time: number) {
    this.clearBadPlayers();
    if (playerid && str) {
      this.words.push(new Word(playerid, str, time));
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
  static parseState(state: string): ParsedRoomData {
    /**
     * TODO: reTS this
     */
    const words = [];
    const finished = !!/.*~$/.exec(state);
    const points: [number, number][] = [];
    let ptsregx = state.matchAll(/(?<id>\d+)(?<pts>\-+)/gi);
    for (const rgp of ptsregx) {
      if (rgp.groups) {
        const { id, pts } = rgp.groups;
        points.push([parseInt(id, 10), pts.length]);
      }
    }
    let regx = state.matchAll(
      /(?<player>\d+?)(?<word>[a-ząćęółńśżź]+)(?<time>\d+?);/gi
    );
    for (const nxt of regx) {
      if (nxt.groups) {
        const { player, word, time } = nxt.groups;
        words.push(new Word(parseInt(player, 10), word, parseInt(time, 10)));
      }
    }
    return [finished, points, words];
  }
  static emitEvent(event: SendEvent, room: Room): void {
    room.eventEmitter.emit("event", event);
  }
}
