"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __asyncValues = (this && this.__asyncValues) || function (o) {
    if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
    var m = o[Symbol.asyncIterator], i;
    return m ? m.call(o) : (o = typeof __values === "function" ? __values(o) : o[Symbol.iterator](), i = {}, verb("next"), verb("throw"), verb("return"), i[Symbol.asyncIterator] = function () { return this; }, i);
    function verb(n) { i[n] = o[n] && function (v) { return new Promise(function (resolve, reject) { v = o[n](v), settle(resolve, reject, v.done, v.value); }); }; }
    function settle(resolve, reject, d, v) { Promise.resolve(v).then(function(v) { resolve({ value: v, done: d }); }, reject); }
};
var __await = (this && this.__await) || function (v) { return this instanceof __await ? (this.v = v, this) : new __await(v); }
var __asyncGenerator = (this && this.__asyncGenerator) || function (thisArg, _arguments, generator) {
    if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
    var g = generator.apply(thisArg, _arguments || []), i, q = [];
    return i = {}, verb("next"), verb("throw"), verb("return"), i[Symbol.asyncIterator] = function () { return this; }, i;
    function verb(n) { if (g[n]) i[n] = function (v) { return new Promise(function (a, b) { q.push([n, v, a, b]) > 1 || resume(n, v); }); }; }
    function resume(n, v) { try { step(g[n](v)); } catch (e) { settle(q[0][3], e); } }
    function step(r) { r.value instanceof __await ? Promise.resolve(r.value.v).then(fulfill, reject) : settle(q[0][2], r); }
    function fulfill(value) { resume("next", value); }
    function reject(value) { resume("throw", value); }
    function settle(f, v) { if (f(v), q.shift(), q.length) resume(q[0][0], q[0][1]); }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fastify_1 = __importDefault(require("fastify"));
const fs = __importStar(require("fs"));
let server = (0, fastify_1.default)({
    logger: { prettyPrint: true, level: "warn" },
});
const queries_1 = __importDefault(require("./queries"));
const errors_1 = require("../shiri_common/errors");
const mysql = __importStar(require("mysql2"));
const hub_1 = __importDefault(require("./hub"));
const word_1 = __importDefault(require("./word"));
const fastify_sse_v2_1 = __importDefault(require("fastify-sse-v2"));
const fastify_cookie_1 = __importDefault(require("fastify-cookie"));
const fastify_cors_1 = __importDefault(require("fastify-cors"));
const events_1 = require("events");
const room_1 = __importDefault(require("./room"));
const dbData = JSON.parse(fs.readFileSync("./dbData.json").toString());
const website = dbData.website;
const cookieDomain = dbData.cookie;
delete dbData.website;
delete dbData.cookie;
if (process.env.dbpass)
    dbData.password = process.env.dbpass;
const pool = mysql.createPool(dbData);
process.on("SIGINT", () => {
    pool.end();
    process.exit(0);
});
const hub = new hub_1.default();
hub.init(pool);
const getError = (status, msg) => {
    const erro = new Error();
    erro.message = msg;
    erro.status = status;
    return erro;
};
const allowCredentials = (res) => {
    res.header("Access-Control-Allow-Credentials", "true");
};
server.register(fastify_sse_v2_1.default);
server.register(fastify_cookie_1.default, {
    secret: "secret",
    paseOptions: { maxAge: 90000 },
});
server.register(fastify_cors_1.default, {
    origin: website,
    optionsSuccessStatus: 200,
});
/** /user */
// Check if player exists by name
server.get("/user/name/:name", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const poolPromise = pool.promise();
    allowCredentials(res);
    const [rows] = yield poolPromise.execute(queries_1.default.getPlayerID, [`${req.params.name}`]);
    if (Array.isArray(rows)) {
        if (rows.length > 0) {
            return rows[0].id;
        }
        throw getError(errors_1.ErrorCode.NO_USER, "Player doesn't exist");
    }
    throw getError(500, "Database didn't return properly!");
}));
server.post("/user/id/:id/login", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const poolPromise = pool.promise();
    allowCredentials(res);
    const [rows] = yield poolPromise.execute(queries_1.default.getPlayerInfo, [req.params.id]);
    if (Array.isArray(rows)) {
        if (rows.length > 0) {
            const { id, pin } = rows[0];
            if (req.body == pin) {
                res.setCookie("loggedas", `${id}`, {
                    secure: true,
                    domain: cookieDomain,
                    path: "/",
                    sameSite: "none",
                });
                return id;
            }
            else
                throw getError(errors_1.ErrorCode.WRONG_PASS, "Złe hasło!");
        }
        throw getError(errors_1.ErrorCode.NO_USER, "Player doesn't exist");
    }
    throw getError(500, "Database didn't return properly!");
}));
server.get("/user/id/:id", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const poolPromise = pool.promise();
    allowCredentials(res);
    const [rows] = yield poolPromise.execute(queries_1.default.getPlayerName, [req.params.id]);
    if (Array.isArray(rows)) {
        if (rows.length > 0) {
            return rows[0].name;
        }
        throw getError(errors_1.ErrorCode.NO_USER, "Player doesn't exist");
    }
    throw getError(500, "Database didn't return properly!");
}));
/** /create */
server.post("/create/:username", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const poolPromise = pool.promise();
    const pin = req.body;
    const username = req.params.username;
    console.log(`Trying to create user: ${username}:${pin}`);
    if (!pin || !username)
        throw { status: 400, message: "No username or pin!" };
    if (!/^\d{6}$/.exec(pin) || !/[a-z0-9]+/i.exec(username))
        throw { status: 400, message: "Wrong username or pin format!" };
    const [selectusernamerows] = yield poolPromise.execute(queries_1.default.getNumberOfPlayersWithUsername, [username]);
    if (Array.isArray(selectusernamerows)) {
        if (parseInt(selectusernamerows[0].n) > 0)
            throw {
                status: 400,
                mesage: "User with given name already exists",
            };
    }
    else {
        throw {
            status: 400,
            message: "Database error! Couldn't check username uniquity!",
        };
    }
    const [insertrows] = yield poolPromise.execute("insert into users (name, pin) values (?,?)", [username, pin]);
    if (insertrows) {
        console.log("\n\nInsertrows:", insertrows, "\n\n");
        if (insertrows.affectedRows > 0) {
            const [newidrow] = yield poolPromise.execute(queries_1.default.getPlayerID, [username]);
            if (newidrow && Array.isArray(newidrow) && newidrow.length > 0) {
                return newidrow[0].id;
            }
            else {
                throw { status: 500, message: "Cannot find you in database!" };
            }
        }
        else {
            throw { status: 500, message: "Couldn't insert anything!" };
        }
    }
    else {
        throw { status: 500, message: "Query went wrong!" };
    }
}));
/** /game */
server.post("/game/create", { logLevel: "warn" }, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    allowCredentials(res);
    const userid = parseInt(req.cookies.loggedas, 10);
    if (!userid)
        throw { status: 403, message: "Not logged in" };
    const options = JSON.parse(req.body);
    const roomid = 99;
    return { status: 200, roomid };
}));
server.post("/game/:id/join", { logLevel: "warn" }, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    allowCredentials(res);
    const userid = parseInt(req.cookies.loggedas, 10);
    const roomid = req.params.id;
    const room = hub.getRoom(parseInt(roomid));
    if (room && userid) {
        console.log(`User ${userid} tries to join room #${roomid}`, room);
        room_1.default.emitEvent({
            data: { type: "join", playerid: userid },
            time: new Date().getTime(),
        }, room);
        if (room.addPlayer(userid)) {
            console.log("Roomstate:", room.getState(), room);
            return {
                status: 200,
                state: room.getState(),
                currplayers: [...room.players],
                language: room.language,
                creator: room.creator,
                modeid: room.getGamemode().id,
            };
        }
        else
            throw { status: 403, message: "Unknown error" };
    }
    else
        throw {
            status: errors_1.ErrorCode.NO_ROOM,
            message: `No room with ID ${roomid}`,
        };
}));
let eventID = 0;
server.post("/game/:id/leave", { logLevel: "warn" }, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    allowCredentials(res);
    const userid = parseInt(req.cookies.loggedas, 10);
    const roomid = parseInt(req.params.id, 10);
    const room = hub.getRoom(roomid);
    if (room) {
        console.log(`\nUser ${userid} leaves room #${roomid}`);
        room_1.default.emitEvent({
            data: { type: "leave", playerid: userid },
            time: new Date().getTime(),
        }, room);
        if (room.removePlayer(userid))
            return "";
        else
            throw "";
    }
    else
        throw {
            status: errors_1.ErrorCode.NO_ROOM,
            message: `No room with ID ${roomid}`,
        };
}));
let busy = false;
server.post("/game/:id/wrong", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    allowCredentials(res);
    const roomid = parseInt(req.params.id, 10);
    const playerid = parseInt(req.cookies.loggedas, 10);
    const room = hub.getRoom(roomid);
    const reason = JSON.parse(req.body).reason;
    console.log(`\nPlayer ${playerid} lost a point in room #${roomid}\n`);
    if (room && playerid) {
        room.addPoints(playerid, -1);
        room_1.default.emitEvent({
            data: { type: "points", playerid, points: -1, reason },
            time: new Date().getTime(),
        }, room);
        hub.saveRoom(room.id, updateRoomSQL);
    }
    return "1";
}));
server.post("/game/:id/send", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    allowCredentials(res);
    const roomid = parseInt(req.params.id, 10);
    const playerid = parseInt(req.cookies.loggedas, 10);
    const room = hub.getRoom(roomid);
    console.log(`\nPlayer ${playerid} sent "${req.body}" in room #${roomid}\n`);
    const word = new word_1.default(playerid, req.body);
    const removePoints = (reason) => {
        if (room) {
            const eventObject = {
                data: {
                    type: "points",
                    playerid,
                    points: -1,
                    reason,
                    word: word.word,
                },
                time: new Date().getTime(),
            };
            console.log("eventObject", eventObject);
            room.addPoints(playerid, -1);
            room_1.default.emitEvent(eventObject, room);
        }
    };
    if (room) {
        if (room.shallowCorrect(word)) {
            busy = true;
            console.log("Deeply testing");
            if (room.checkDictionary(word)) {
                console.log("Deep finished!");
                if (!room.checkForWord(word)) {
                    if (room.shiriCheck(word)) {
                        room.registerWord(word.playerid, word.word, word.time);
                        room.addPoints(playerid, room.getGamemode().wordToPts(word));
                        room_1.default.emitEvent({
                            data: { type: "input", playerid, word: word.word },
                            time: word.time,
                        }, room);
                    }
                    else {
                        // shiri bad
                        console.log("Word doesn't start at last letter of prev word");
                        removePoints("wrongStart");
                    }
                }
                else {
                    console.log("Word already used", word);
                    removePoints("alreadyIn");
                }
            }
            else {
                console.log("Not in dictionary #", room.language);
                removePoints("notInDic");
            }
        }
        else {
            console.log("Shallow check failed");
            removePoints("notInDic");
        }
        hub.saveRoom(room.id, updateRoomSQL);
    }
    else {
        // no room
    }
    busy = false;
    return "1";
}));
server.post("/game/where", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    allowCredentials(res);
    const userid = parseInt(req.cookies.loggedas, 10);
    const roomid = hub.whereIs(userid);
    if (roomid)
        return roomid;
    else
        throw { status: errors_1.ErrorCode.NO_ROOM };
}));
const updateRoomSQL = (roomid, state) => __awaiter(void 0, void 0, void 0, function* () {
    const poolPromise = pool.promise();
    yield poolPromise.execute(queries_1.default.updateRoom, [state, roomid]);
    return;
});
const recacheRooms = () => __awaiter(void 0, void 0, void 0, function* () {
    yield hub.saveRooms(updateRoomSQL);
    yield hub.init(pool);
    console.log(hub);
    return "Done";
});
server.get("/game/list/refresh", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    return yield recacheRooms();
}));
const recacheEach = 5;
let recacheRoomsCount = recacheEach;
server.get("/game/list", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    recacheRoomsCount--;
    if (recacheRoomsCount <= 0) {
        recacheRooms();
        recacheRoomsCount = recacheEach;
    }
    const roomlist = hub.rooms.reduce((prev, next) => {
        return (prev +
            `${next.id}[${next.getNumberOfPlayersLoggedIn()}/${next.maxPlayers}]${next.mode}!`);
    }, "");
    return roomlist;
}));
/** /logout */
server.post("/logout", { logLevel: "warn" }, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    allowCredentials(res);
    const userid = parseInt(req.cookies.loggedas, 10);
    if (!userid)
        return true;
    const roomid = hub.whereIs(userid);
    if (roomid) {
        const room = hub.getRoom(roomid);
        if (room) {
            room_1.default.emitEvent({
                data: { type: "leave", playerid: userid },
                time: new Date().getTime(),
            }, room);
            room.removePlayer(userid);
        }
    }
    res.clearCookie("loggedas");
    return true;
}));
/** /events */
server.get("/events/:roomid", { logLevel: "warn" }, (req, res) => {
    allowCredentials(res);
    const roomid = parseInt(req.params.roomid, 10);
    const room = hub.getRoom(roomid);
    if (room) {
        res.sse((function () {
            return __asyncGenerator(this, arguments, function* () {
                var e_1, _a;
                try {
                    for (var _b = __asyncValues((0, events_1.on)(room.eventEmitter, "event")), _c; _c = yield __await(_b.next()), !_c.done;) {
                        const e = _c.value;
                        const event = e;
                        const yieldData = {
                            data: JSON.stringify(event[0]),
                        };
                        console.log("yielding", yieldData);
                        yield yield __await(yieldData);
                    }
                }
                catch (e_1_1) { e_1 = { error: e_1_1 }; }
                finally {
                    try {
                        if (_c && !_c.done && (_a = _b.return)) yield __await(_a.call(_b));
                    }
                    finally { if (e_1) throw e_1.error; }
                }
            });
        })());
    }
});
const start = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield server.listen(3002, "::");
    }
    catch (err) {
        server.log.error(err);
        process.exit(1);
    }
});
start();
