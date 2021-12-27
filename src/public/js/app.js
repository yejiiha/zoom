const socket = new WebSocket(`ws://${window.location.host}`);

const messageList = document.querySelector("ul");
const messageForm = document.querySelector("#message");
const nickForm = document.querySelector("#nickname");

const makeMessage = (type, payload) => {
  const msg = { type, payload };
  return JSON.stringify(msg);
};

socket.addEventListener("open", () => {
  console.log("Connected to Server! ✅");
});

socket.addEventListener("message", (message) => {
  const list = document.createElement("li");
  list.innerText = message.data;
  messageList.append(list);
});

socket.addEventListener("close", () => {
  console.log("Disconnected to Server! ❌");
});

const handleMessageSubmit = (event) => {
  event.preventDefault();
  const input = messageForm.querySelector("input");

  socket.send(makeMessage("new_message", String(input.value)));

  input.value = "";
};

const handleNickSubmit = (event) => {
  event.preventDefault();
  const input = nickForm.querySelector("input");

  socket.send(makeMessage("nickname", String(input.value)));
};

messageForm.addEventListener("submit", handleMessageSubmit);
nickForm.addEventListener("submit", handleNickSubmit);
