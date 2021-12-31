import express from "express";
import http from "http";
import SocketIO from "socket.io";

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
const wsServer = SocketIO(httpServer);

wsServer.on("connection", (socket) => {
  socket.onAny((event) => {
    console.log(`Socket Event: ${event}`);
  });

  socket.on("joinRoom", (roomName) => {
    socket.join(roomName);

    socket.to(roomName).emit("welcome");
  });

  socket.on("offer", (offer, roomName) => {
    socket.to(roomName).emit("offer", offer);
  });

  socket.on("answer", (answer, roomName) => {
    socket.to(roomName).emit("answer", answer);
  });

  socket.on("ice", (ice, roomName) => {
    socket.to(roomName).emit("ice", ice);
  });
});

httpServer.listen(3000, handleListen);
