import { initializeApp } from "firebase/app";
import { getDatabase, ref, child, get, set } from "firebase/database";
import { getFirestore, collection, getDocs } from "firebase/firestore/lite";

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

const app = initializeApp(firebaseConfig);
const db = getDatabase();

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

async function test() {
  const s = await getFirebaseData();
  console.log(s);
}

const refs = {
  timerClock: document.querySelector(".timer-clock"),
  startBtn: document.querySelector(".start-btn"),
  stopBtn: document.querySelector(".stop-btn"),
};

refs.startBtn.addEventListener("click", startTimer);
refs.stopBtn.addEventListener("click", stopTimer);

const BASE_URL = "https://65e867424bb72f0a9c4f37f6.mockapi.io/timerData/1";
const STEP = 10;

let fetchData;
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
};
let previousData;

async function getData() {
  const data = await fetch(BASE_URL).then((r) => r.json());
  return data;
}

function updateData() {
  const options = {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(result),
  };
  fetch(BASE_URL, options).then((r) => r.json());
}

const check = setInterval(() => {
  checkData();
}, 100);

async function checkData() {
  previousData = await getFirebaseData();

  if (previousData.isStart) {
    refs.startBtn.disabled = true;
    refs.startBtn.style.opacity = "0.5";
    refs.stopBtn.disabled = false;
    refs.stopBtn.style.opacity = "1";
  } else {
    refs.startBtn.disabled = false;
    refs.startBtn.style.opacity = "1";
    refs.stopBtn.disabled = true;
    refs.stopBtn.style.opacity = "0.5";
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
  };

  writeData(result);
}
