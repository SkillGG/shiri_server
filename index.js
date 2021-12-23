const { default: fastify } = require("fastify")
let server = fastify({
  logger: { prettyPrint: true, level: "warn" },
})

const Queries = require("./queries").default
const Errors = require("./errors").default

const mysql = require("mysql2")

const Hub = require("./hub")
const Word = require("./word").default

const logConsole = (msg, ...opt) =>
  console.log(`\n${msg}`, ...opt, `\n\n`)

/*
const website = "http://localhost:3000"
const cookieDomain = "localhost"
const dbData = {
  host: "localhost",
  password: "game",
  user: "game",
  database: "agrafka",
}
*/

const website = "https://shiri.skillgg.repl.co"
const cookieDomain = "skillgg.repl.co"
const dbData = {
  host: "sql11.freemysqlhosting.net",
  password: process.env.dbpass,
  user: "sql11460587",
  database: "sql11460587",
}

console.log("dbData", dbData)

const pool = mysql.createPool(dbData)

const hub = new Hub()
hub.init(pool).then((_) => console.log(hub.getRoom(1)))

const getError = (status, msg) => {
  const erro = new Error()
  erro.message = msg
  erro.status = status
  return erro
}

const doesPlayerExist = (id) => {}

const allowCredentials = (res) => {
  res.header("Access-Control-Allow-Credentials", "true")
}

server.register(require("fastify-sse"), {
  err: (err) => {
    if (err) throw err
  },
})

server.register(require("fastify-cookie"), {
  secret: "secret",
  paseOptions: { maxAge: 90000 },
})

server.register(require("fastify-cors"), {
  origin: website,
  optionsSuccessStatus: 200,
})

/** /user */

// Check if player exists by name
server.get("/user/name/:name", async (req, res) => {
  const poolPromise = pool.promise()
  allowCredentials(res)
  const [rows] = await poolPromise.execute(Queries.getPlayerID, [
    `${req.params.name}`,
  ])
  if (Array.isArray(rows)) {
    if (rows.length > 0) {
      return rows[0].id
    }
    throw getError(Errors.NO_USER, "Player doesn't exist")
  }
  throw getError(500, "Database didn't return properly!")
})

server.post("/user/id/:id/login", async (req, res) => {
  const poolPromise = pool.promise()
  allowCredentials(res)
  const [rows] = await poolPromise.execute(Queries.getPlayerInfo, [
    req.params.id,
  ])
  if (Array.isArray(rows)) {
    if (rows.length > 0) {
      console.log(rows[0])
      const { id, pin } = rows[0]
      if (req.body == pin) {
        res.setCookie("loggedas", `${id}`, {
          secure: true,
          domain: cookieDomain,
          path: "/",
          sameSite: "none",
        })
        return id
      } else throw getError(Errors.WRONG_PASS, "Złe hasło!")
    }
    throw getError(Errors.NO_USER, "Player doesn't exist")
  }
  throw getError(500, "Database didn't return properly!")
})

server.get("/user/id/:id", async (req, res) => {
  const poolPromise = pool.promise()
  allowCredentials(res)
  const [rows] = await poolPromise.execute(Queries.getPlayerName, [
    req.params.id,
  ])

  if (Array.isArray(rows)) {
    if (rows.length > 0) {
      return rows[0].name
    }
    throw getError(Errors.NO_USER, "Player doesn't exist")
  }
  throw getError(500, "Database didn't return properly!")
})

/** /create */

server.post("/create/:username", async (req, res) => {
  const poolPromise = pool.promise()
  const pin = req.body
  const username = req.params.username
  console.log(`Trying to create user: ${username}:${pin}`)
  if (!pin || !username)
    throw { status: 400, message: "No username or pin!" }
  if (!/^\d{6}$/.exec(pin) || !/[a-z0-9]+/i.exec(username))
    throw { status: 400, message: "Wrong username or pin format!" }
  const [selectusernamerows] = await poolPromise.execute(
    Queries.getNumberOfPlayersWithUsername,
    [username],
  )
  if (Array.isArray(selectusernamerows)) {
    if (parseInt(selectusernamerows[0].n) > 0)
      throw {
        status: 400,
        mesage: "User with given name already exists",
      }
  } else {
    throw {
      status: 400,
      message: "Database error! Couldn't check username uniquity!",
    }
  }
  const [insertrows] = await poolPromise.execute(
    "insert into users (name, pin) values (?,?)",
    [username, pin],
  )
  if (insertrows) {
    console.log("\n\nInsertrows:", insertrows, "\n\n")
    if (insertrows.affectedRows > 0) {
      const [newidrow] = await poolPromise.execute(
        Queries.getPlayerID,
        [username],
      )
      if (
        newidrow &&
        Array.isArray(newidrow) &&
        newidrow.length > 0
      ) {
        return newidrow[0].id
      } else {
        throw { status: 500, message: "Cannot find you in database!" }
      }
    } else {
      throw { status: 500, message: "Couldn't insert anything!" }
    }
  } else {
    throw { status: 500, message: "Query went wrong!" }
  }
})

/** /game */

server.post(
  "/game/create",
  { logLevel: "warn" },
  async (req, res) => {
    allowCredentials(res)
    const userid = parseInt(req.cookies.loggedas, 10)
    if (!userid) throw { status: 403, message: "Not logged in" }
    const options = JSON.parse(req.body)
    console.log(options)
    const roomid = 99
    return { status: 200, roomid }
  },
)

server.post(
  "/game/:id/join",
  { logLevel: "warn" },
  async (req, res) => {
    allowCredentials(res)
    const userid = parseInt(req.cookies.loggedas, 10)
    const roomid = req.params.id
    const room = hub.getRoom(parseInt(roomid))
    if (room && userid) {
      console.log(
        `User ${userid} tries to join room #${roomid}`,
        room,
      )
      room.sendEvent?.({
        data: { type: "joined", playerid: `${userid}`, data: userid },
      })
      if (room.addPlayer(userid))
        return {
          status: 200,
          state: room.getState(),
          currplayers: [...room.players],
          language: room.language,
          creator: room.creator,
        }
      else throw { status: 403, message: "Unknown error" }
    } else
      throw {
        status: Errors.NO_ROOM,
        message: `No room with ID ${roomid}`,
      }
  },
)

let eventID = 0

server.post(
  "/game/:id/leave",
  { logLevel: "warn" },
  async (req, res) => {
    allowCredentials(res)
    const userid = req.cookies.loggedas
    const roomid = req.params.id
    const room = hub.getRoom(roomid)
    if (room) {
      console.log(`\nUser ${userid} leaves room #${roomid}`)
      room.sendEvent?.({
        data: { type: "left", playerid: userid, data: userid },
      })
      if (room.removePlayer(userid)) return ""
      else throw ""
    } else
      throw {
        status: Errors.NO_ROOM,
        message: `No room with ID ${roomid}`,
      }
  },
)

let busy = false

server.post("/game/:id/wrong", async (req, res) => {
  allowCredentials(res)
  const roomid = req.params.id
  const playerid = parseInt(req.cookies.loggedas, 10)
  const room = hub.getRoom(roomid)
  console.log(
    `\nPlayer ${playerid} lost a point in room #${roomid}\n`,
  )
  if (room && playerid) {
    room.addPoints(playerid, -1)
    room.sendEvent({
      data: { type: "points", playerid, data: -1 },
      time: new Date().getTime(),
    })
  }
  hub.saveRoom(room.id, updateRoomSQL)
  return "1"
})

server.post("/game/:id/send", async (req, res) => {
  allowCredentials(res)
  const roomid = req.params.id
  const playerid = parseInt(req.cookies.loggedas, 10)
  const room = hub.getRoom(roomid)
  console.log(
    `\nPlayer ${playerid} sent "${req.body}" in room #${roomid}\n`,
    )
    const word = new Word(playerid, req.body)
  const removePoints = (reason) => {
    room.addPoints(playerid, -1)
    room.sendEvent({
      data: {
        type: "points",
        playerid,
        data: { points: -1, reason, word: word.word },
      },
      time: new Date().getTime(),
    })
  }
  if (room) {
    if (room.shallowCorrect(word)) {
      busy = true
      console.log("Deeply testing")
      if (room.checkDictionary(word)) {
        console.log("Deep finished!")
        if (!room.checkForWord(word)) {
          if (!room.shiriCheck(word)) {
            room.registerWord(word.playerid, word.word, word.time)
            room.addPoints(playerid, 1)
            room.sendEvent({
              data: { type: "input", playerid, data: word.word },
              time: word.time,
            })
          } else {
            // shiri bad
            console.log("Word doesn't start at last letter of prev word")
            removePoints("wrongStart")
          }
        } else {
          console.log("Word already used", word)
          removePoints("alreadyIn")
        }
      } else {
        console.log("Not in dictionary #", room.language)
        removePoints("notInDic")
      }
    } else {
      console.log("Shallow check failed")
      removePoints("notInDic")
    }
  } else {
    // no room
  }
  busy = false
  hub.saveRoom(room.id, updateRoomSQL)
  return "1"
})

server.post("/game/where", async (req, res) => {
  allowCredentials(res)
  const userid = req.cookies.loggedas
  const roomid = hub.whereIs(userid)
  if (roomid) return roomid
  else throw { status: Errors.NO_ROOM }
})

const updateRoomSQL = async (roomid, state) => {
  const poolPromise = pool.promise()
  await poolPromise.execute(Queries.updateRoom, [state, roomid])
  return
}

const recacheRooms = async () => {
  await hub.saveRooms(updateRoomSQL)
  await hub.init(pool)
  console.log(hub)
  return "Done"
}

server.get("/game/list/refresh", async (req, res) => {
  return await recacheEach
})

const recacheEach = 5
let recacheRoomsCount = recacheEach

server.get("/game/list", async (req, res) => {
  recacheRoomsCount--
  if (recacheRoomsCount <= 0) {
    recacheRooms()
    recacheRoomsCount = recacheEach
  }
  const roomlist = hub.rooms.reduce((prev, next) => {
    return (
      prev +
      `${next.id}[${next.getNumberOfPlayersLoggedIn()}/${
        next.maxPlayers
      }]`
    )
  }, "")
  return roomlist
})

/** /logout */

server.post("/logout", { logLevel: "warn" }, async (req, res) => {
  allowCredentials(res)
  const userid = req.cookies.loggedas
  if (!userid) return true
  const roomid = hub.whereIs(userid)
  if (roomid) {
    hub.getRoom(roomid).sendEvent({
      data: { type: "left", playerid: userid, data: userid },
    })
    hub.getRoom(roomid).removePlayer(userid)
  }
  res.clearCookie("loggedas")
  return true
})

/** /events */
server.get("/events/:roomid", { logLevel: "warn" }, (req, res) => {
  allowCredentials(res)
  let room = hub.getRoom(req.params.roomid)
  let playerid = parseInt(req.cookies.loggedas)
  if (room) {
    room.assignSend(playerid, (event) => {
      console.log("Sending to: ", playerid, "\nevent:\n", event)
      let time = new Date().getTime()
      if (event.time) {
        time = event.time
        delete event.time
      }
      const ssePayload = {
        data: event.data,
        time: time,
        id: eventID++,
      }
      const sseString = JSON.stringify(ssePayload)
      console.log("\npayload:", ssePayload, "\n")
      res.sse(sseString)
    })
    room.sendEvent = (event) => {
      console.log("\nevent:", event, "\n", room.sendEvents, "\n")
      room.sendEvents.forEach((e, i) => e?.call(null, event))
    }
  }
})

const start = async () => {
  try {
    await server.listen(3002, "::")
  } catch (err) {
    server.log.error(err)
    process.exit(1)
  }
}
start()
