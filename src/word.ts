const wordRegex = [/^[a-z]+$/i, /^[a-ząćęłóśźż]+$/i];

import WordList from "./wordlist";

class Word {
  playerid: number;
  word: string;
  time: number;
  constructor(player: number, str: string, time?: number) {
    this.playerid = player;
    this.word = str;
    this.time = time || new Date().getTime();
  }
  getStatus() {
    return `${this.playerid}${this.word}${this.time};`;
  }
  shallowCorrect(lang: number) {
    return !!wordRegex[lang || 0].exec(this.word);
  }
  deepCorrect(lang: number) {
    if (!WordList.ready) return console.error("Not ready yet!"), false;
    return WordList[lang || 0].has(this.word.toLowerCase());
  }
}
export default Word;