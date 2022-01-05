declare class Word {
    playerid: number;
    word: string;
    time: number;
    constructor(player: number, str: string, time?: number);
    getStatus(): string;
    shallowCorrect(lang: number): boolean;
    deepCorrect(lang: number): boolean;
}
export default Word;
