import express from "express";

const app = express();

// pug로 view engine 설정
app.set("view engine", "pug");

// express에 template이 어디 있는지 지정
app.set("views", __dirname + "/views");

// 유저에게 파일을 공유
app.use("/public", express.static(__dirname + "/public"));

// home.pug를 render 해주는 route handler 생성
app.get("/", (req, res) => res.render("home"));

const handleListen = () => console.log(`✨ Listening on http://localhost:3000`);

app.listen(3000, handleListen);
