import * as FirebaseApi from "/service/firebase-api";
import { refs } from "./components/refs";
import { nanoid } from "nanoid";
import {
  checkLogin,
  getName,
  getTask,
  logOut,
  onBack,
} from "./components/utilites";
import editIcon from "/edit.svg";
import { onErrorToast } from "./components/utilites";

checkLogin();
checkTask();

refs.backBtn.addEventListener("click", onBack);
refs.logOutBtn.addEventListener("click", logOut);
refs.startBtn.addEventListener("click", onStart);
refs.stopBtn.addEventListener("click", onStop);
refs.stepsList.addEventListener("click", onDelete);
refs.resetBtn.addEventListener("click", onReset);
refs.resetBackdrop.addEventListener("click", onDecideReset);
refs.taskInput.addEventListener("input", () => {
  refs.taskInput.classList.remove("task-input-required");
});
refs.taskForm.addEventListener("submit", onSaveTask);

refs.navName.innerHTML = JSON.parse(localStorage.getItem("log")).user;

FirebaseApi.checkDefaultData();
FirebaseApi.checkDefaultList();

async function onStart() {
  if (!localStorage.getItem("task")) {
    refs.taskInput.classList.add("task-input-required");
    onErrorToast("Please, enter the task", "#task");
    return;
  }

  const startDate = Date.now();

  const data = await FirebaseApi.getDefaultData();
  refs.taskInput.classList.remove("task-input-required");

  FirebaseApi.setDefaultData({
    ...data,
    isStart: true,
    start: startDate,
  });
}

async function onStop() {
  const stopDate = Date.now();

  const data = await FirebaseApi.getDefaultData();
  const stepsList = await FirebaseApi.getDefaultStepsList();

  const stepNum = stepsList.items.length > 0 ? stepsList.items.length + 1 : 1;
  const time = stopDate - data.start;
  const task = localStorage.getItem("task");
  const user = JSON.parse(localStorage.getItem("log")).user;

  const newStepItem = {
    id: nanoid(),
    step: stepNum,
    time: time,
    user: user,
    task: task,
  };

  FirebaseApi.addDefaultStepToList(newStepItem);

  FirebaseApi.setDefaultData({
    ...data,
    isStart: false,
    stop: stopDate,
  });
}

async function onDelete(e) {
  if (e.target.nodeName !== "BUTTON") {
    return;
  }

  FirebaseApi.deleteDefaultStepById(e.target.id);
}

function onReset() {
  refs.resetBackdrop.classList.remove("visually-hidden");
  document.querySelector("body").style.overflow = "hidden";
  document.addEventListener("keydown", closeModalByEsc);
}

function onDecideReset(e) {
  if (
    e.target.classList.contains("no-btn") ||
    e.target.classList.contains("backdrop")
  ) {
    refs.resetBackdrop.classList.add("visually-hidden");
  } else if (e.target.classList.contains("yes-btn")) {
    FirebaseApi.resetDefaultStepList();
    refs.resetBackdrop.classList.add("visually-hidden");
  }
  document.querySelector("body").style.overflow = "visible";
  document.removeEventListener("keydown", closeModalByEsc);
  return;
}

function closeModalByEsc(e) {
  if (e.code !== "Escape") return;
  refs.resetBackdrop.classList.add("visually-hidden");
  document.querySelector("body").style.overflow = "visible";
  document.removeEventListener("keydown", closeModalByEsc);
}

function onSaveTask(e) {
  e.preventDefault();

  if (!refs.taskInput.value) {
    refs.taskInput.classList.add("task-input-required");
    onErrorToast("Please, enter the task", "#task");
    return;
  }

  localStorage.setItem("task", refs.taskInput.value);
  checkTask();
}

function checkTask() {
  if (!localStorage.getItem("task")) {
    refs.username.innerHTML = `Hi ${getName()},`;
    return;
  }

  refs.taskWrap.insertAdjacentHTML(
    "afterbegin",
    `<button type="button" class="edit-btn"><img class="edit-icon" src="${editIcon}"/></button>`
  );
  refs.taskForm.classList.add("task-form-hidden");
  refs.username.innerHTML = `Great ${getName()}!`;
  refs.taskFormDescription.innerHTML = `The task you'll be timing is "${getTask()}".`;
  document.querySelector(".edit-btn").addEventListener("click", onEdit);
}

function onEdit() {
  localStorage.removeItem("task");
  document.querySelector(".edit-btn").remove();
  refs.taskForm.classList.remove("task-form-hidden");
  refs.username.innerHTML = `Hi ${getName()},`;
  refs.taskFormDescription.innerHTML = `Before you begin, please enter the name of the task in the box below and click on the "Save" button.`;
}
