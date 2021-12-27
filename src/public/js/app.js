const socket = new WebSocket(`ws://${window.location.host}`);

const messageList = document.querySelector("ul");
const messageForm = document.querySelector("form");

socket.addEventListener("open", () => {
  console.log("Connected to Server! ✅");
});

socket.addEventListener("message", (message) => {
  console.log("💌 New message : ", message.data);
});

socket.addEventListener("close", () => {
  console.log("Disconnected to Server! ❌");
});

const handleSubmit = (event) => {
  event.preventDefault();
  const input = messageForm.querySelector("input");
  socket.send(String(input.value));

  input.value = "";
};

messageForm.addEventListener("submit", handleSubmit);
