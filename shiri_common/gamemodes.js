"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WinConditions = exports.ScoringSystems = exports.errTimeout = exports.defaultGameMode = exports.defaultWinCondition = exports.defaultScoring = void 0;
exports.defaultScoring = {
    wordToPts() {
        return 1;
    },
    onWordCame() { },
    onPtsCame(points, room, refs) {
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
    isWin() {
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
    exports.defaultScoring,
    Object.assign(Object.assign({}, exports.defaultScoring), { id: 1, description: "+1over4", wordToPts(word) {
            return word.word.length - 4;
        },
        wordCSSClass(word) {
            return `plus1over4 ${word.word.length < 4 ? "plus1over4_bad" : ""}`;
        } }),
    Object.assign(Object.assign({}, exports.defaultScoring), { id: 2, description: "length", wordToPts: (word) => word.word.length }),
    Object.assign(Object.assign({}, exports.defaultScoring), { id: 101, description: "+1over4_safe", wordToPts(word) {
            return word.word.length > 4 ? word.word.length - 4 : 1;
        }, wordCSSClass: () => `plus1over4` }),
];
exports.WinConditions = [
    exports.defaultWinCondition,
    {
        description: "overN",
        id: 1,
        isWin(room, points) {
            const { points: maxpts } = room.creationdata.WinCondition.data;
            console.log("goal", maxpts);
            if (maxpts) {
                const winner = [...points].find((pts) => {
                    console.log(pts, maxpts);
                    return pts[1] >= maxpts;
                });
                console.log(winner);
                if (winner)
                    return winner[0];
            }
            return false;
        },
    },
];
