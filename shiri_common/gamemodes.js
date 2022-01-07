"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GameModes = exports.errTimeout = exports.gmToNN = exports.defaultGameMode = void 0;
exports.defaultGameMode = {
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
    isWin: function (room, players) {
        return false;
    },
    id: 0,
    description: "default options",
    wordCSSClass: () => "",
};
const gmToNN = (gm) => {
    if (gm) {
        const mode = typeof gm === "number" ? exports.GameModes[gm] : gm;
        return Object.assign(Object.assign({}, exports.defaultGameMode), mode);
    }
    else
        return exports.defaultGameMode;
};
exports.gmToNN = gmToNN;
exports.errTimeout = 2000;
exports.GameModes = [
    {
        id: 1,
        description: "+1over4",
        wordToPts: (word) => {
            return word.word.length - 4;
        },
        wordCSSClass: (w) => `plus1over4 ${w.word.length < 4 ? "plus1over4_bad" : ""}`,
    },
];
