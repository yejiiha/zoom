const socket = io(); // socket.io를 실행하고 있는 서버를 찾음

const welcome = document.getElementById("welcome");
const welcomeForm = welcome.querySelector("form");
const room = document.getElementById("room");
const changeNameInput = room.querySelector("#name input");
const exitBtn = document.getElementById("exit");

room.hidden = true;

let roomName;

const addMessage = (message) => {
  const ul = room.querySelector("ul");
  const li = document.createElement("li");

  li.innerText = message;

  ul.appendChild(li);
};

const handleMessageSubmit = (e) => {
  e.preventDefault();

  const input = room.querySelector("#msg input");
  const value = input.value;

  socket.emit("newMessage", input.value, roomName, () => {
    addMessage(`You(${changeNameInput.value}): ${value}`);
  }); // 백엔드로 메세지 보내기

  input.value = "";
};

const handleNameSubmit = (e) => {
  e.preventDefault();

  const input = room.querySelector("#name input");
  const value = input.value;

  socket.emit("nickname", input.value); // 닉네임 저장하기
};

const showRoom = () => {
  welcome.hidden = true;
  room.hidden = false;

  const h3 = room.querySelector("h3");
  h3.innerText = `${roomName}`;

  const msgForm = room.querySelector("#msg");
  const nameForm = room.querySelector("#name");

  msgForm.addEventListener("submit", handleMessageSubmit);
  nameForm.addEventListener("submit", handleNameSubmit);
};

const handleRoomSubmit = (e) => {
  e.preventDefault();
  const roomNameInput = welcomeForm.querySelector("#roomName");
  const nickNameInput = welcomeForm.querySelector("#nickname");

  socket.emit("enterRoom", roomNameInput.value, nickNameInput.value, showRoom);

  roomName = roomNameInput.value;
  roomNameInput.value = "";

  changeNameInput.value = nickNameInput.value;
};

const exitClick = (e) => {
  socket.emit("exit", changeNameInput.value, roomName);
  welcome.hidden = false;
  room.hidden = true;
};

welcomeForm.addEventListener("submit", handleRoomSubmit);

socket.on("welcome", (user, newCount) => {
  const h3 = room.querySelector("h3");
  h3.innerText = `${roomName} (${newCount})`;

  addMessage(`${user} joined! 😀`);
});

socket.on("bye", (left, newCount) => {
  const h3 = room.querySelector("h3");
  h3.innerText = `${roomName} (${newCount})`;

  addMessage(`${left} left... 😭`);
});

socket.on("newMessage", addMessage);

socket.on("roomChange", (rooms) => {
  const roomList = welcome.querySelector("ul");
  roomList.innerHTML = "";

  if (rooms.length === 0) {
    return;
  }

  rooms.forEach((room) => {
    const li = document.createElement("li");
    li.innerText = room;
    roomList.append(li);
  });
});

exitBtn.addEventListener("click", exitClick);
