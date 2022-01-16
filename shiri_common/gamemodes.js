"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WinConditions = exports.ScoringSystems = exports.errTimeout = exports.defaultGameMode = exports.defaultWinCondition = exports.defaultScoring = void 0;
exports.defaultScoring = {
    wordToPts: function (word) {
        return 1;
    },
    onWordCame: function (word, refs) { },
    onPtsCame: (points, room, refs) => {
        const { pts, playerid } = points;
        console.log("onptscame:", points);
        if (pts == 0)
            return;
        if (refs) {
            refs.playerList.addPointState((prev) => {
                return new Map([...prev, [playerid, pts]]);
            });
            setTimeout(() => {
                refs.playerList.addPointState((prev) => new Map([...prev, [playerid, 0]]));
            }, exports.errTimeout);
        }
    },
    wordCSSClass: () => "",
    id: 0,
    description: "default",
};
exports.defaultWinCondition = {
    isWin: function (room, players) {
        return false;
    },
    id: 0,
    description: "default",
};
exports.defaultGameMode = {
    scoring: exports.defaultScoring,
    wincondition: exports.defaultWinCondition,
};
exports.errTimeout = 2000;
exports.ScoringSystems = [
    Object.assign(Object.assign({}, exports.defaultScoring), { id: 1, description: "+1over4", wordToPts: (word) => {
            return word.word.length - 4;
        }, wordCSSClass: (w) => `plus1over4 ${w.word.length < 4 ? "plus1over4_bad" : ""}` }),
    Object.assign(Object.assign({}, exports.defaultScoring), { id: 2, description: "length", wordToPts: (word) => word.word.length }),
];
exports.WinConditions = [];
