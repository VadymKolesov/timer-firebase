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
let result = {
  id: "1",
  start: 0,
  stop: 0,
  isStart: false,
  current: 0,
  isReady: 0,
};

let previousData;

async function setReady() {
  previousData = await getFirebaseData();
  result = previousData;

  if (result.isReady < 2) {
    result.isReady += 1;
    writeData(result);
  }

  refs.readyBtn.classList.remove("active-btn");
  refs.readyBtn.classList.add("inactive-btn");
  refs.readyBtn.classList.disabled = true;

  if (previousData.isReady === 2) {
    refs.readyBtn.classList.remove("active-btn");
    refs.readyBtn.classList.add("inactive-btn");
    refs.readyBtn.classList.disabled = true;
  }
}

const check = setInterval(() => {
  checkData();
}, 100);

async function checkData() {
  previousData = await getFirebaseData();
  if (previousData.isReady === 0 || previousData.isStart) {
    refs.readyUsers.innerHTML = ``;
  }
  if (
    previousData.isReady > 0 &&
    !previousData.isStart &&
    document.querySelectorAll(".ready-message").length === 0
  ) {
    refs.readyUsers.insertAdjacentHTML(
      "afterbegin",
      `<li class="user"><img src="${checkIcon}" class="check-icon" /><p class="ready-message">First user is ready.</p></li>`
    );
    refs.readyUsers.firstElementChild.classList.add("user-visible");
  } else if (
    previousData.isReady === 2 &&
    !previousData.isStart &&
    document.querySelectorAll(".ready-message").length < 2
  ) {
    refs.readyUsers.insertAdjacentHTML(
      "afterbegin",
      `<li class="user"><img src="${checkIcon}" class="check-icon" /><p class="ready-message">Second user is ready.</p></li>`
    );
    refs.readyUsers.firstElementChild.classList.add("user-visible");
  }

  if (previousData.isReady < 0 || previousData.isReady >= 2) {
    refs.readyBtn.disabled = true;
    refs.readyBtn.classList.remove("active-btn");
    refs.readyBtn.classList.add("inactive-btn");
  } else if (previousData.isReady >= 0) {
    refs.readyBtn.disabled = false;
    refs.readyBtn.classList.add("active-btn");
    refs.readyBtn.classList.remove("inactive-btn");
  } else if (previousData.isReady < 2) {
    refs.readyBtn.disabled = true;
    refs.startBtn.classList.remove("active-btn");
    refs.startBtn.classList.add("inactive-btn");
  }

  if (previousData.isStart || previousData.isReady !== 2) {
    refs.startBtn.disabled = true;
    refs.startBtn.classList.remove("active-btn");
    refs.startBtn.classList.add("inactive-btn");
    // refs.stopBtn.disabled = false;
    // refs.stopBtn.classList.add("active-btn");
    // refs.stopBtn.classList.remove("inactive-btn");
  } else if (!previousData.isStart || previousData.isReady === 2) {
    refs.startBtn.disabled = false;
    refs.startBtn.classList.add("active-btn");
    refs.startBtn.classList.remove("inactive-btn");
    // refs.stopBtn.disabled = true;
    // refs.stopBtn.classList.remove("active-btn");
    // refs.stopBtn.classList.add("inactive-btn");
  }
  if (previousData.isStart && previousData.isReady === 2) {
    refs.stopBtn.disabled = false;
    refs.stopBtn.classList.add("active-btn");
    refs.stopBtn.classList.remove("inactive-btn");
  }
  if (!previousData.isStart && previousData.isReady !== 2) {
    refs.stopBtn.disabled = true;
    refs.stopBtn.classList.remove("active-btn");
    refs.stopBtn.classList.add("inactive-btn");
  }

  if (previousData.isStart && !timerInterval) {
    startDate = previousData.start;
    timerInterval = setInterval(startInterval, STEP);
  } else if (!previousData.isStart && timerInterval > 1) {
    clearInterval(timerInterval);
    timerInterval = false;
    formatedTime = convertMS(previousData.current - previousData.start);
    rendeClock(
      formatedTime.minutes,
      formatedTime.secunds,
      formatedTime.milisecunds
    );
  } else if (!previousData.isStart && !timerInterval) {
    formatedTime = convertMS(previousData.current - previousData.start);
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

  refs.stopBtn.classList.remove("active-btn");
  refs.stopBtn.classList.add("inactive-btn");
  refs.stopBtn.disabled = true;
}
