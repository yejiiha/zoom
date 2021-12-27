import express from "express";
import http from "http";
import WebSocket from "ws";

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
const server = http.createServer(app); // http 서버에 access 하기
const wss = new WebSocket.Server({ server }); // http 서버 위에 ws 서버 만들기

const sockets = [];

wss.on("connection", (socket) => {
  sockets.push(socket);
  socket["nickname"] = "Anonymous";
  console.log("Connected to Browser! ✅");

  socket.on("close", () => {
    console.log("Disconnected to Browser! ❌");
  });

  socket.on("message", (data) => {
    const message = JSON.parse(data.toString("utf8"));
    console.log(message);

    switch (message.type) {
      case "new_message":
        sockets.forEach((s) =>
          s.send(`${socket.nickname}: ${message.payload}`)
        );

      case "nickname":
        socket["nickname"] = message.payload;

      default:
        break;
    }
  });
});

server.listen(3000, handleListen);
