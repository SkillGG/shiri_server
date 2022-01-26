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
    letterCSSClass: () => "",
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
const GM1_DEFAULTDATA = { length: 4 };
exports.ScoringSystems = [
    exports.defaultScoring,
    Object.assign(Object.assign({}, exports.defaultScoring), { id: 1, description: "+1overN", wordToPts(word, room) {
            const { length = GM1_DEFAULTDATA.length } = room.creationdata.Score.data;
            return word.word.length - length;
        },
        wordCSSClass(word, room) {
            const { length = GM1_DEFAULTDATA.length } = room.creationdata.Score.data;
            return `plus1overN ${word.word.length < length ? "plus1overN_bad" : ""}`;
        },
        letterCSSClass(w, i, room) {
            const { length = GM1_DEFAULTDATA.length } = room.creationdata.Score.data;
            return (i >= length && "pointed") || "";
        } }),
    Object.assign(Object.assign({}, exports.defaultScoring), { id: 2, description: "length", wordToPts: (word) => word.word.length }),
    Object.assign(Object.assign({}, exports.defaultScoring), { id: 101, description: "+1overN_safe", wordToPts(word, room) {
            const { length = GM1_DEFAULTDATA.length } = room.creationdata.Score.data;
            return word.word.length > length ? word.word.length - length : 1;
        }, wordCSSClass: () => `plus1overN_safe`, letterCSSClass(w, i, room) {
            const { length = GM1_DEFAULTDATA.length } = room.creationdata.Score.data;
            return (i >= length && "pointed") || "";
        } }),
];
exports.WinConditions = [
    exports.defaultWinCondition,
    {
        description: "overN",
        id: 1,
        isWin(room, points) {
            const { points: maxpts } = room.creationdata.WinCondition.data;
            if (maxpts) {
                const winner = [...points].find((pts) => {
                    return pts[1] >= maxpts;
                });
                if (winner)
                    return winner[0];
            }
            return false;
        },
    },
];
