import { default as fastify, FastifyReply, FastifyRequest } from "fastify";
import * as fs from "fs";
let server = fastify({
  logger: { prettyPrint: true, level: "warn" },
});

import Queries from "./queries";
import { ErrorCode as Errors } from "../shiri_common/errors";

import * as mysql from "mysql2";

import Hub, { SQLUpdateRoom } from "./hub";
import Word from "./word";
import { RouteGenericInterface } from "fastify/types/route";
import { Server, IncomingMessage, ServerResponse } from "http";
import FastifySSEPlugin from "fastify-sse-v2";
import CookiePlugin, { FastifyCookieOptions } from "fastify-cookie";
import CorsPlugin, { FastifyCorsOptions } from "fastify-cors";
import { on } from "events";
import Room, { EventData } from "./room";
import {
  NewRoomData,
  SendEvent,
  Room as BaseRoom,
  existsWinCondition,
} from "../shiri_common/base";
import { WinConditions } from "../shiri_common/gamemodes";
import { OkPacket } from "mysql2";

type xSql<T> = (T & mysql.OkPacket)[];

type databaseInfo = {
  host: string;
  password: string;
  user: string;
  database: string;
  website?: string;
  cookie?: string;
};

type RemovePtsReason = "wrongStart" | "alreadyIn" | "notInDic" | undefined;

const dbData: databaseInfo = JSON.parse(
  fs.readFileSync("./dbData.json").toString()
);

const website = dbData.website;
const cookieDomain = dbData.cookie;
delete dbData.website;
delete dbData.cookie;
if (process.env.dbpass) dbData.password = process.env.dbpass;

const pool = mysql.createPool(dbData);

process.on("SIGINT", () => {
  pool.end();
  process.exit(0);
});

const hub: Hub = new Hub();
hub.init(pool);

const getError = (status: number, msg: string) => {
  const erro: Error & { status?: number } = new Error();
  erro.message = msg;
  erro.status = status;
  return erro;
};

type FResponse = FastifyReply<
  Server,
  IncomingMessage,
  ServerResponse,
  RouteGenericInterface,
  unknown
>;

type FRequest<T> = FastifyRequest<{ Params: T; Body: string }>;

const allowCredentials = (res: FResponse) => {
  res.header("Access-Control-Allow-Credentials", "true");
};

server.register(FastifySSEPlugin);

server.register(CookiePlugin, {
  secret: "secret",
  paseOptions: { maxAge: 90000 },
} as FastifyCookieOptions);

server.register(CorsPlugin, {
  origin: website,
  optionsSuccessStatus: 200,
} as FastifyCorsOptions);

/** /user */

// Check if player exists by name
server.get("/user/name/:name", async (req: FRequest<{ name: string }>, res) => {
  const poolPromise = pool.promise();
  allowCredentials(res);
  const [rows] = await poolPromise.execute<xSql<{ id: string }>>(
    Queries.getPlayerID,
    [`${req.params.name}`]
  );
  if (Array.isArray(rows)) {
    if (rows.length > 0) {
      return rows[0].id;
    }
    throw getError(Errors.NO_USER, "Player doesn't exist");
  }
  throw getError(500, "Database didn't return properly!");
});

server.post(
  "/user/id/:id/login",
  async (req: FRequest<{ id: string }>, res) => {
    const poolPromise = pool.promise();
    allowCredentials(res);
    const [rows] = await poolPromise.execute<xSql<{ id: string; pin: string }>>(
      Queries.getPlayerInfo,
      [req.params.id]
    );
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
        } else throw getError(Errors.WRONG_PASS, "Złe hasło!");
      }
      throw getError(Errors.NO_USER, "Player doesn't exist");
    }
    throw getError(500, "Database didn't return properly!");
  }
);

server.get("/user/id/:id", async (req: FRequest<{ id: string }>, res) => {
  const poolPromise = pool.promise();
  allowCredentials(res);
  const [rows] = await poolPromise.execute<xSql<{ name: string }>>(
    Queries.getPlayerName,
    [req.params.id]
  );

  if (Array.isArray(rows)) {
    if (rows.length > 0) {
      return rows[0].name;
    }
    throw getError(Errors.NO_USER, "Player doesn't exist");
  }
  throw getError(500, "Database didn't return properly!");
});

/** /create */

server.post(
  "/create/:username",
  async (req: FRequest<{ username: string }>, res) => {
    const poolPromise = pool.promise();
    const pin = req.body;
    const username = req.params.username;
    console.log(`Trying to create user: ${username}:${pin}`);
    if (!pin || !username)
      throw { status: 400, message: "No username or pin!" };
    if (!/^\d{6}$/.exec(pin) || !/[a-z0-9]+/i.exec(username))
      throw { status: 400, message: "Wrong username or pin format!" };
    const [selectusernamerows] = await poolPromise.execute<xSql<{ n: string }>>(
      Queries.getNumberOfPlayersWithUsername,
      [username]
    );
    if (Array.isArray(selectusernamerows)) {
      if (parseInt(selectusernamerows[0].n) > 0)
        throw {
          status: 400,
          mesage: "User with given name already exists",
        };
    } else {
      throw {
        status: 400,
        message: "Database error! Couldn't check username uniquity!",
      };
    }
    const [insertrows] = await poolPromise.execute<mysql.OkPacket>(
      "insert into users (name, pin) values (?,?)",
      [username, pin]
    );
    if (insertrows) {
      console.log("\n\nInsertrows:", insertrows, "\n\n");
      if (insertrows.affectedRows > 0) {
        const [newidrow] = await poolPromise.execute<xSql<{ id: string }>>(
          Queries.getPlayerID,
          [username]
        );
        if (newidrow && Array.isArray(newidrow) && newidrow.length > 0) {
          return newidrow[0].id;
        } else {
          throw { status: 500, message: "Cannot find you in database!" };
        }
      } else {
        throw { status: 500, message: "Couldn't insert anything!" };
      }
    } else {
      throw { status: 500, message: "Query went wrong!" };
    }
  }
);

/** /game */

server.post(
  "/game/create",
  { logLevel: "warn" },
  async (req: FRequest<{}>, res) => {
    allowCredentials(res);
    const creatorid = parseInt(req.cookies.loggedas, 10);
    const { MaxPlayers, Score, WinCondition, Dictionary } = JSON.parse(
      req.body
    ) as NewRoomData;
    const freeRoomID = hub.getNextFreeRoom();
    const room = new Room(
      freeRoomID,
      undefined,
      undefined,
      false,
      MaxPlayers,
      undefined,
      Dictionary,
      creatorid,
      {
        WinCondition,
        Score,
      }
    );
    hub.addRoom(room);
    const promise = pool.promise();
    const [insert] = await promise.execute<OkPacket>(Queries.createRoom, [
      freeRoomID,
      creatorid,
      Dictionary,
      Score,
      WinCondition,
      MaxPlayers,
    ]);
    if (insert.affectedRows > 0) return { id: room.id };
    else return { err: true };
  }
);

server.post(
  "/game/:id/join",
  { logLevel: "warn" },
  async (req: FRequest<{ id: string }>, res) => {
    allowCredentials(res);
    const userid = parseInt(req.cookies.loggedas, 10);
    const roomid = req.params.id;
    const room = hub.getRoom(parseInt(roomid));
    if (room && userid) {
      console.log(`User ${userid} tries to join room #${roomid}`, room);
      Room.emitEvent(
        {
          data: { type: "join", playerid: userid },
          time: new Date().getTime(),
        },
        room
      );
      const add = room.addPlayer(userid);
      if (add) {
        if (add.done) {
          console.log("Roomstate:", room.getState(), room);
          const mode = room.getGamemode();
          const ret: BaseRoom & { status: number } = {
            status: 200,
            state: room.getState(),
            currplayers: [...room.players],
            creator: room.creator,
            creationdata: {
              MaxPlayers: room.maxPlayers,
              Score: room.mode.Score,
              WinCondition: room.mode.WinCondition,
              Dictionary: room.language,
            },
          };
          return ret;
        } else {
          throw { status: 400, message: add.error };
        }
      } else throw { status: 403, message: "Unknown error" };
    } else
      throw {
        status: Errors.NO_ROOM,
        message: `No room with ID ${roomid}`,
      };
  }
);

let eventID = 0;

server.post(
  "/game/:id/leave",
  { logLevel: "warn" },
  async (req: FRequest<{ id: string }>, res) => {
    allowCredentials(res);
    const userid = parseInt(req.cookies.loggedas, 10);
    const roomid = parseInt(req.params.id, 10);
    const room = hub.getRoom(roomid);
    if (room) {
      console.log(`\nUser ${userid} leaves room #${roomid}`);
      Room.emitEvent(
        {
          data: { type: "leave", playerid: userid },
          time: new Date().getTime(),
        },
        room
      );
      if (room.removePlayer(userid)) return "";
      else throw "";
    } else
      throw {
        status: Errors.NO_ROOM,
        message: `No room with ID ${roomid}`,
      };
  }
);

let busy = false;

server.post("/game/:id/wrong", async (req: FRequest<{ id: string }>, res) => {
  allowCredentials(res);
  const roomid = parseInt(req.params.id, 10);
  const playerid = parseInt(req.cookies.loggedas, 10);
  const room = hub.getRoom(roomid);
  const reason = JSON.parse(req.body).reason;
  console.log(`\nPlayer ${playerid} lost a point in room #${roomid}\n`);
  if (room && playerid) {
    room.addPoints(playerid, -1);
    Room.emitEvent(
      {
        data: { type: "points", playerid, points: -1, reason },
        time: new Date().getTime(),
      },
      room
    );
    hub.saveRoom(room.id, updateRoomSQL);
  }
  return "1";
});

server.post("/game/:id/send", async (req: FRequest<{ id: string }>, res) => {
  allowCredentials(res);
  const roomid = parseInt(req.params.id, 10);
  const playerid = parseInt(req.cookies.loggedas, 10);
  const room = hub.getRoom(roomid);
  console.log(`\nPlayer ${playerid} sent "${req.body}" in room #${roomid}\n`);
  const word = new Word(playerid, req.body);
  const removePoints = (reason: RemovePtsReason) => {
    if (room) {
      const eventObject: SendEvent = {
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
      Room.emitEvent(eventObject, room);
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
            room.addPoints(
              playerid,
              room.getGamemode().scoring.wordToPts(word)
            );
            Room.emitEvent(
              {
                data: { type: "input", playerid, word: word.word },
                time: word.time,
              },
              room
            );
          } else {
            // shiri bad
            console.log("Word doesn't start at last letter of prev word");
            removePoints("wrongStart");
          }
        } else {
          console.log("Word already used", word);
          removePoints("alreadyIn");
        }
      } else {
        console.log("Not in dictionary #", room.language);
        removePoints("notInDic");
      }
    } else {
      console.log("Shallow check failed");
      removePoints("notInDic");
    }
    hub.saveRoom(room.id, updateRoomSQL);
  } else {
    // no room
  }
  busy = false;
  return "1";
});

server.post("/game/where", async (req, res) => {
  allowCredentials(res);
  const userid = parseInt(req.cookies.loggedas, 10);
  const roomid = hub.whereIs(userid);
  if (roomid) return roomid;
  else throw { status: Errors.NO_ROOM };
});

const updateRoomSQL = async (roomid: number, state: string) => {
  const poolPromise = pool.promise();
  await poolPromise.execute(Queries.updateRoom, [state, roomid]);
  return;
};

const recacheRooms = async () => {
  await hub.saveRooms(updateRoomSQL);
  await hub.init(pool);
  console.log(hub);
  return "Done";
};

server.get("/game/list/refresh", async (req, res) => {
  return await recacheRooms();
});

const recacheEach = 5;
let recacheRoomsCount = recacheEach;

server.get("/game/list", async (req, res) => {
  recacheRoomsCount--;
  if (recacheRoomsCount <= 0) {
    recacheRooms();
    recacheRoomsCount = recacheEach;
  }
  const roomlist = hub.rooms.reduce((prev, next) => {
    return (
      prev +
      `${next.id}[${next.getNumberOfPlayersLoggedIn()}/${next.maxPlayers}]${
        next.mode
      }!`
    );
  }, "");
  return roomlist;
});

/** /logout */

server.post("/logout", { logLevel: "warn" }, async (req, res) => {
  allowCredentials(res);
  const userid = parseInt(req.cookies.loggedas, 10);
  if (!userid) return true;
  const roomid = hub.whereIs(userid);
  if (roomid) {
    const room = hub.getRoom(roomid);
    if (room) {
      Room.emitEvent(
        {
          data: { type: "leave", playerid: userid },
          time: new Date().getTime(),
        },
        room
      );
      room.removePlayer(userid);
    }
  }
  res.clearCookie("loggedas");
  return true;
});

/** /check */

server.post("/check/:id", async (req: FRequest<{ id: string }>, res) => {
  allowCredentials(res);
  const playerid = parseInt(req.cookies.loggedas, 10);
  const room = hub.getRoom(parseInt(req.params.id, 10));
  console.log("checking connection to player ", playerid, room?.id);
  if (room) {
    Room.emitEvent(
      {
        data: { type: "check", playerid },
        time: new Date().getTime(),
      },
      room
    );
  }
  return 1;
});

/** /events */
server.get(
  "/events/:roomid",
  { logLevel: "warn" },
  (req: FRequest<{ roomid: string }>, res) => {
    allowCredentials(res);
    const roomid = parseInt(req.params.roomid, 10);
    const room = hub.getRoom(roomid);
    if (room) {
      res.sse(
        (async function* () {
          for await (const e of on(room.eventEmitter, "event")) {
            const event = e as EventData;
            const yieldData = {
              data: JSON.stringify(event[0]),
            };
            console.log("yielding", yieldData);
            yield yieldData;
          }
        })()
      );
    }
  }
);

const start = async () => {
  try {
    await server.listen(3002, "::");
  } catch (err) {
    server.log.error(err);
    process.exit(1);
  }
};
start();
