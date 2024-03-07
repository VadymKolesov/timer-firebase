import { initializeApp } from "firebase/app";
import { getDatabase, ref, child, get, set } from "firebase/database";
import checkIcon from "./check.svg";

const refs = {
  timerClock: document.querySelector(".timer-clock"),
  startBtn: document.querySelector(".start-btn"),
  stopBtn: document.querySelector(".stop-btn"),
  readyBtn: document.querySelector(".ready-btn"),
  readyUsers: document.querySelector(".ready-users"),
};

const firebaseConfig = {
  apiKey: "AIzaSyCuVjEugcofQtVmUyg1Bm1vmoIkKJ7-dfU",
  authDomain: "timer-b359e.firebaseapp.com",
  databaseURL:
    "https://timer-b359e-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "timer-b359e",
  storageBucket: "timer-b359e.appspot.com",
  messagingSenderId: "544796112036",
  appId: "1:544796112036:web:dea584d81b16885d642231",
};

initializeApp(firebaseConfig);

function writeData(data) {
  const db = getDatabase();
  set(ref(db, "timer/"), data);
}

async function getFirebaseData() {
  const dbRef = ref(getDatabase());
  const data = await get(child(dbRef, `timer/`))
    .then((snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        return data;
      } else {
        console.log("No data available");
      }
    })
    .catch((error) => {
      console.error(error);
    });
  return data;
}

refs.startBtn.addEventListener("click", startTimer);
refs.stopBtn.addEventListener("click", stopTimer);
refs.readyBtn.addEventListener("click", setReady);

const STEP = 10;

let startDate;
let stopDate;
let currentDate;
let timerInterval;
let formatedTime;
let result;
let previousData;

const enableReadyBtn = () => {
  refs.readyBtn.disabled = false;
  refs.readyBtn.classList.add("active-btn");
  refs.readyBtn.classList.remove("inactive-btn");
};

const disableReadyBtn = () => {
  refs.readyBtn.disabled = true;
  refs.readyBtn.classList.remove("active-btn");
  refs.readyBtn.classList.add("inactive-btn");
};

const enableStartBtn = () => {
  refs.startBtn.disabled = false;
  refs.startBtn.classList.add("active-btn");
  refs.startBtn.classList.remove("inactive-btn");
};

const disableStartBtn = () => {
  refs.startBtn.disabled = true;
  refs.startBtn.classList.remove("active-btn");
  refs.startBtn.classList.add("inactive-btn");
};

const enableStopBtn = () => {
  refs.stopBtn.disabled = false;
  refs.stopBtn.classList.add("active-btn");
  refs.stopBtn.classList.remove("inactive-btn");
};

const disableStopBtn = () => {
  refs.stopBtn.disabled = true;
  refs.stopBtn.classList.remove("active-btn");
  refs.stopBtn.classList.add("inactive-btn");
};

const setReadyID = (id) => {
  localStorage.setItem("readyID", id);
};

const getReadyID = () => {
  return JSON.parse(localStorage.getItem("readyID"));
};

async function setReady() {
  previousData = await getFirebaseData();

  if (previousData.isReady < 2) {
    previousData.isReady += 1;
    writeData(previousData);
    setReadyID(previousData.isReady);
  }

  if (previousData.isReady === 2) {
    disableReadyBtn();
  }
}

const check = setInterval(() => {
  checkData();
}, 100);

function showUsers(data) {
  const readyMessages = document.querySelectorAll(".user");

  if (data.isStart) {
    refs.readyUsers.innerHTML = "";
    return;
  } else if (
    data.isReady === 1 &&
    !data.isStart &&
    readyMessages.length === 0
  ) {
    refs.readyUsers.insertAdjacentHTML(
      "afterbegin",
      `<li class="user"><img src="${checkIcon}" class="check-icon" /><p class="ready-message">First user is ready.</p></li>`
    );
    refs.readyUsers.firstElementChild.classList.add("user-visible");
  } else if (data.isReady === 2 && !data.isStart && readyMessages.length < 2) {
    refs.readyUsers.insertAdjacentHTML(
      "afterbegin",
      `<li class="user"><img src="${checkIcon}" class="check-icon" /><p class="ready-message">Second user is ready.</p></li>`
    );
    refs.readyUsers.firstElementChild.classList.add("user-visible");
  }
}

async function checkData() {
  previousData = await getFirebaseData();
  const readyID = await getReadyID();
  const isReady = previousData.isReady;
  const isStart = previousData.isStart;

  if (!isStart && isReady < 2) {
    enableReadyBtn();
    disableStopBtn();
  } else if (!isStart && isReady >= 2) {
    disableReadyBtn();
    enableStartBtn();
  } else if (isStart) {
    disableStartBtn();
    enableStopBtn();
    setReadyID(3);
  }

  if (readyID === isReady) {
    disableReadyBtn();
  }

  showUsers(previousData);
  updateClock(previousData);
}

function updateClock(data) {
  if (data.isStart && !timerInterval) {
    startDate = data.start;
    timerInterval = setInterval(startInterval, STEP);
  } else if (!data.isStart && timerInterval > 1) {
    clearInterval(timerInterval);
    timerInterval = false;
    formatedTime = convertMS(data.current - data.start);
    rendeClock(
      formatedTime.minutes,
      formatedTime.secunds,
      formatedTime.milisecunds
    );
  } else if (!data.isStart && !timerInterval) {
    formatedTime = convertMS(data.current - data.start);
    rendeClock(
      formatedTime.minutes,
      formatedTime.secunds,
      formatedTime.milisecunds
    );
  }
}

function convertMS(ms) {
  const sec = 1000;
  const min = sec * 60;
  const h = min * 60;
  const day = h * 24;

  const minutes = Math.floor(((ms % day) % h) / min)
    .toString()
    .padStart(2, "0");
  const secunds = Math.floor((((ms % day) % h) % min) / sec)
    .toString()
    .padStart(2, "0");
  const milisecunds = ms.toString().substr(ms.toString().length - 3, 3);

  return { minutes, secunds, milisecunds };
}

function rendeClock(min, sec, ms) {
  refs.timerClock.textContent = `${min}:${sec},${ms}`;
}

function startInterval() {
  currentDate = new Date().getTime();
  const time = currentDate - Number(startDate);
  formatedTime = convertMS(time);
  rendeClock(
    formatedTime.minutes,
    formatedTime.secunds,
    formatedTime.milisecunds
  );
}

function startTimer() {
  startDate = new Date().getTime();
  result = {
    id: "1",
    isStart: true,
    start: new Date().getTime(),
    stop: 0,
    current: 0,
    isReady: 2,
  };

  writeData(result);
}

function stopTimer() {
  startDate = previousData.start;
  stopDate = new Date().getTime();

  result = {
    id: "1",
    start: startDate,
    stop: stopDate,
    isStart: false,
    current: currentDate,
    isReady: 0,
  };

  writeData(result);
}
