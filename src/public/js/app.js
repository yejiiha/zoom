const socket = io(); // socket.io를 실행하고 있는 서버를 찾음

const myFace = document.getElementById("myFace");
const muteBtn = document.getElementById("mute");
const cameraBtn = document.getElementById("camera");
const camerasSelect = document.getElementById("cameras");

const call = document.getElementById("call");

call.hidden = true;

let myStream;
let muted = false;
let cameraOff = false;
let roomName;
let myPeerConnection;

const getCameras = async () => {
  try {
    const devices = await navigator.mediaDevices.enumerateDevices();
    const cameras = devices.filter((device) => device.kind === "videoinput");
    const currentCamera = myStream.getVideoTracks()[0];

    cameras.forEach((camera) => {
      const option = document.createElement("option");
      option.value = camera.deviceId;
      option.innerText = camera.label;

      // 현재 사용하고 있는 카메라 select에서 보여주기
      if (currentCamera.label === camera.label) {
        option.selected = true;
      }

      camerasSelect.appendChild(option);
    });
  } catch (error) {
    console.log(error);
  }
};

const getMedia = async (deviceId) => {
  const initConstrains = {
    audio: true,
    video: {
      facingMode: "user",
    },
  };
  const newConstrains = {
    audio: true,
    video: {
      deviceId: {
        exact: deviceId,
      },
    },
  };

  try {
    myStream = await navigator.mediaDevices.getUserMedia(
      deviceId ? newConstrains : initConstrains
    );

    myFace.srcObject = myStream;

    if (!deviceId) {
      await getCameras();
    }
  } catch (error) {
    console.log(error);
  }
};

const handleMuteClick = () => {
  myStream
    .getAudioTracks()
    .forEach((track) => (track.enabled = !track.enabled));

  console.log(myStream.getAudioTracks());

  if (!muted) {
    muteBtn.innerText = "Unmute";
    muted = true;
  } else {
    muteBtn.innerText = "Mute";
    muted = false;
  }
};

const handleCameraClick = () => {
  myStream
    .getVideoTracks()
    .forEach((track) => (track.enabled = !track.enabled));

  if (cameraOff) {
    cameraBtn.innerText = "Turn Camera Off";
    cameraOff = false;
  } else {
    cameraBtn.innerText = "Turn Camera On";
    cameraOff = true;
  }
};

const handleCameraChange = async () => {
  await getMedia(camerasSelect.value);
};

muteBtn.addEventListener("click", handleMuteClick);
cameraBtn.addEventListener("click", handleCameraClick);
camerasSelect.addEventListener("input", handleCameraChange);

// Welcome Form (Join a room)

const welcome = document.getElementById("welcome");
const welcomeForm = welcome.querySelector("form");

const initCall = async () => {
  welcome.hidden = true;
  call.hidden = false;

  await getMedia();

  makeConnection();
};

const handelWelcomeSubmit = async (e) => {
  e.preventDefault();

  const input = welcomeForm.querySelector("input");

  await initCall();

  socket.emit("joinRoom", input.value);
  roomName = input.value;

  input.value = "";
};

welcomeForm.addEventListener("submit", handelWelcomeSubmit);

// Socket code

// Run on peer A
socket.on("welcome", async () => {
  console.log("someone joined");
  // 다른 브라우저가 참가하도록 offer 만들기
  const offer = await myPeerConnection?.createOffer();
  myPeerConnection?.setLocalDescription(offer);

  // peer B로 offer 보내기
  socket.emit("offer", offer, roomName);
});

// Run on peer B
socket.on("offer", async (offer) => {
  console.log("received the offer");
  // peer A가 보낸 offer 받기
  myPeerConnection?.setRemoteDescription(offer);

  // 대답 만들기
  const answer = await myPeerConnection?.createAnswer();
  myPeerConnection?.setLocalDescription(answer);

  // peer A로 answer 보내기
  socket.emit("answer", answer, roomName);
  console.log("send the answer");
});

// Run on peer A
socket.on("answer", (answer) => {
  console.log("receive the answer");

  myPeerConnection?.setRemoteDescription(answer);
});

// Run on peer B
socket.on("ice", (ice) => {
  console.log("received candidate");

  myPeerConnection.addIceCandidate(ice);
});

// RTC Code
const makeConnection = () => {
  myPeerConnection = new RTCPeerConnection();
  myPeerConnection.addEventListener("icecandidate", handleIce);
  myPeerConnection.addEventListener("addstream", handleAddStream);
  myStream
    .getTracks()
    .forEach((track) => myPeerConnection.addTrack(track, myStream));
};

const handleIce = (data) => {
  console.log("sent candidate");
  socket.emit("ice", data.candidate, roomName);
};

const handleAddStream = (data) => {
  console.log("got an stream from my peer");
  console.log("peer's stream: ", data.stream);
  console.log("my stream: ", myStream);

  const peerFace = document.getElementById("peerFace");
  peerFace.srcObject = data.stream;
};
