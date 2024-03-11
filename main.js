import { initializeApp } from "firebase/app";
import { nanoid } from "nanoid";
import {
  getDatabase,
  ref,
  child,
  get,
  set,
  push,
  onValue,
  onChildAdded,
} from "firebase/database";
import checkIcon from "./check.svg";

import {
  doc,
  onSnapshot,
  getFirestore,
  addDoc,
  setDoc,
  getDocs,
  collection,
  initializeFirestore,
  getDoc,
  documentId,
} from "firebase/firestore";

const refs = {
  timerClock: document.querySelector(".timer-clock"),
  startBtn: document.querySelector(".start-btn"),
  stopBtn: document.querySelector(".stop-btn"),
  readyBtn: document.querySelector(".ready-btn"),
  readyUsers: document.querySelector(".ready-users"),
  readyContent: document.querySelector(".ready-content"),
  loader: document.querySelector(".loader-wrap"),
  stepsList: document.querySelector(".steps-list"),
  deleteBtn: document.querySelector(".delete-btn"),
  btnsList: document.querySelector(".list-btns"),
  resetBtn: document.querySelector(".reset-btn"),
  sendBtn: document.querySelector(".send-btn"),
  postBackdrop: document.querySelector(".post-backdrop"),
  resetBackdrop: document.querySelector(".reset-backdrop"),
  nobtn: document.querySelector(".no-btn"),
  yesbtn: document.querySelector(".yes-btn"),
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

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
let stepsList;

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

async function fetchList() {
  const docRef = await getDocs(collection(db, "list"));

  const unsub = onSnapshot(doc(db, "list", "Oi4nFSVsaGY2GQtak5IO"), (doc) => {
    const data = doc.data().items.reverse();
    refs.stepsList.innerHTML = updateList(data);
    if (document.querySelectorAll(".step-item").length > 0) {
      refs.btnsList.classList.add("btns-list-visible");
    } else {
      refs.btnsList.classList.remove("btns-list-visible");
    }
  });
}

fetchList();

function getStepsList() {
  return getDocs(collection(db, "list"));
}

async function addStepToList(data) {
  const docRef = await setDoc(doc(db, "list", "Oi4nFSVsaGY2GQtak5IO"), {
    items: data,
  });
}

function updateList(list) {
  return list
    .map(
      (el) => `
    <li class="step-item">
      <div>
        <p class="step">Step ${el.step}</p>
        <p class="time">${el.time}</p>
      </div>
      <button id="${el.id}" type="button" class="delete-btn">Delete</button>
    </li>
  `
    )
    .join("");
}

// async function getStepsList() {
//   const dbRef = ref(getDatabase());
//   const data = await get(child(dbRef, `list/`))
//     .then((snapshot) => {
//       if (snapshot.exists()) {
//         const data = snapshot.val();
//         return data;
//       } else {
//         console.log("No data available");
//       }
//     })
//     .catch((error) => {
//       console.error(error);
//     });
// }

// getStepsList();

refs.startBtn.addEventListener("click", startTimer);
refs.stopBtn.addEventListener("click", stopTimer);
refs.readyContent.addEventListener("click", setReady);
refs.stepsList.addEventListener("click", deleteStep);
refs.resetBtn.addEventListener("click", openResetModal);
refs.sendBtn.addEventListener("click", sendStepsData);
refs.nobtn.addEventListener("click", closeResetModal);
refs.yesbtn.addEventListener("click", resetSteps);

const STEP = 10;

let startDate;
let stopDate;
let currentDate;
let timerInterval;
let formatedTime;
let result;
let previousData;

const enableReadyBtn = () => {
  refs.readyContent.disabled = false;
  refs.readyContent.classList.add("active-btn");
  refs.readyContent.classList.remove("inactive-btn");
};

const disableReadyBtn = () => {
  refs.readyContent.disabled = true;
  refs.readyContent.classList.remove("active-btn");
  refs.readyContent.classList.add("inactive-btn");
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

function setReadyBtnContent(data, readyID) {
  if (data.isReady === 2 && !data.isStart) {
    refs.readyBtn.textContent = `All users ready`;
    refs.loader.classList.add("hide-loader");
    return;
  } else if (data.isStart) {
    refs.readyBtn.textContent = `Timer is active`;
    return;
  } else if (data.isReady === 0) {
    refs.readyBtn.textContent = `I'm ready`;
    return;
  } else if (data.isReady === readyID) {
    refs.readyBtn.textContent = `Waiting for users`;
    refs.loader.classList.remove("hide-loader");
    return;
  }
}

async function checkData() {
  previousData = await getFirebaseData();
  const readyID = await getReadyID();
  const isReady = previousData.isReady;
  const isStart = previousData.isStart;

  if (!isStart && isReady < 2 && readyID !== isReady) {
    enableReadyBtn();
    disableStopBtn();
  } else if (!isStart && isReady >= 2) {
    disableReadyBtn();
    enableStartBtn();
    // refs.readyBtn.innerHTML = `All users ready`;
  } else if (isStart) {
    disableStartBtn();
    enableStopBtn();
    // refs.readyBtn.innerHTML = `Timer is active`;
    setReadyID(3);
  }

  if (readyID === isReady) {
    disableReadyBtn();
    // refs.readyBtn.innerHTML = `Waiting for second user`;
  }

  setReadyBtnContent(previousData, readyID);

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

async function stopTimer() {
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

  const data = await getStepsList();
  data.forEach((doc) => {
    const prevData = doc.data().items;
    let stepNum = 0;
    prevData.forEach((e) => {
      stepNum += 1;
      e.step = stepNum;
    });
    const newItem = {
      id: nanoid(),
      step: stepNum + 1,
      time: refs.timerClock.textContent,
    };
    const newData = [...prevData, newItem];
    addStepToList(newData);
  });
}

async function deleteStep(e) {
  if (e.target.nodeName !== "BUTTON") {
    return;
  }

  const data = await getStepsList();
  const id = e.target.id;

  data.forEach((doc) => {
    const prevData = doc.data().items;
    let stepNum = 0;
    const filteredData = prevData.filter((el) => el.id !== id);
    filteredData.forEach((e) => {
      stepNum += 1;
      e.step = stepNum;
    });
    addStepToList(filteredData);
  });
}

function openResetModal() {
  refs.resetBackdrop.classList.remove("visually-hidden");
}

function closeResetModal() {
  refs.resetBackdrop.classList.add("visually-hidden");
}

function resetSteps() {
  addStepToList([]);
  refs.resetBackdrop.classList.add("visually-hidden");
}

async function sendStepsData() {
  const data = await getStepsList();

  data.forEach((doc) => {
    const prevData = doc.data().items;
    postStepsData(prevData);
  });
}

async function postStepsData(data) {
  const options = {
    method: "POST",
    body: JSON.stringify(data),
    headers: {
      "Content-type": "text/plain;charset=utf-8",
    },
  };

  document.querySelector("body").style.overflow = "hidden";
  refs.postBackdrop.classList.remove("visually-hidden");

  fetch(
    "https://script.google.com/macros/s/AKfycbxkgREKaVwId_CSh-A9tGSpYJBZAhpViMmn9Qmep3g4W3UwEscNvenCwPgtuyVRCVrA/exec",
    options
  )
    .then((res) => {
      console.log("done");
      document.querySelector("body").style.overflow = "visible";
      refs.postBackdrop.innerHTML = `<div class="done-message"><img src="${checkIcon}" class="done-icon" /><p>Done</p></div>`;
      setTimeout(() => {
        refs.postBackdrop.classList.add("visually-hidden");
        refs.postBackdrop.innerHTML = `<div class="loader-backdrop"></div>`;
      }, 1000);
    })
    .catch((err) => {
      console.log(err);
      refs.postBackdrop.innerHTML = `<p class="error-message">Oops. Something went wrong. Please, try again.</p>`;
      setTimeout(() => {
        document.querySelector("body").style.overflow = "visible";
        refs.postBackdrop.classList.add("visually-hidden");
        refs.postBackdrop.innerHTML = `<div class="loader-backdrop"></div>`;
      }, 2000);
    });
}
