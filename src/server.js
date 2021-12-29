import express from "express";
import http from "http";
import { Server } from "socket.io";
import { instrument } from "@socket.io/admin-ui";

const app = express();

// pug로 view engine 설정
app.set("view engine", "pug");

// express에 template이 어디 있는지 지정
app.set("views", __dirname + "/views");

// 유저에게 파일을 공유
app.use("/public", express.static(__dirname + "/public"));

// home.pug를 render 해주는 route handler 생성
app.get("/", (req, res) => res.render("home"));
app.get("/*", (req, res) => res.redirect("/"));

const handleListen = () => console.log(`✨ Listening on http://localhost:3000`);

// http 서버와 ws 서버를 동시에 작동시키기
const httpServer = http.createServer(app); // http 서버에 access 하기
const wsServer = new Server(httpServer, {
  cors: {
    origin: ["https://admin.socket.io"],
    credentials: true,
  },
});

instrument(wsServer, {
  auth: false,
});

const publicRooms = () => {
  const {
    sockets: {
      adapter: { sids, rooms },
    },
  } = wsServer;

  const publicRoomList = [];

  rooms.forEach((_, key) => {
    if (sids.get(key) === undefined) {
      publicRoomList.push(key);
    }
  });

  return publicRoomList;
};

const countRoom = (roomName) => {
  return wsServer.sockets.adapter.rooms.get(roomName)?.size;
};

wsServer.on("connection", (socket) => {
  socket["nickname"] = "Anonymous";
  socket.onAny((event) => {
    console.log(wsServer.sockets.adapter);
    console.log(`Socket Event: ${event}`);
  });

  socket.on("enterRoom", (roomName, nickname, callback) => {
    socket["nickname"] = nickname;
    socket.join(roomName); // 채팅 방 들어가기
    callback();

    socket.to(roomName).emit("welcome", socket.nickname, countRoom(roomName)); // 채팅 방에 있는 모든 사람에게 메세지 보내기

    wsServer.sockets.emit("roomChange", publicRooms());
  });

  // 채팅 방과 연결 끊기
  socket.on("disconnecting", () => {
    socket.rooms.forEach((room) =>
      socket.to(room).emit("bye", socket.nickname, countRoom(room) - 1)
    );
  });

  socket.on("disconnect", () => {
    wsServer.sockets.emit("roomChange", publicRooms());
  });

  // 메세지 보내기
  socket.on("newMessage", (msg, room, callback) => {
    socket.to(room).emit("newMessage", `${socket.nickname}: ${msg}`);
    callback();
  });

  socket.on("nickname", (nickname) => (socket["nickname"] = nickname));

  socket.on("exit", (nickname, room) => {
    socket.rooms.forEach((room) =>
      socket.to(room).emit("bye", socket.nickname, countRoom(room) - 1)
    );

    socket.leave(room);

    wsServer.sockets.emit("roomChange", publicRooms());
  });
});

httpServer.listen(3000, handleListen);
