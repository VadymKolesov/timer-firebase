import warningIcon from "../../icons/warning.svg";
import Toastify from "toastify-js";
import "toastify-js/src/toastify.css";

export const convertMs = (ms) => {
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

  const result = {
    minutes,
    secunds,
    milisecunds,
  };

  return result;
};

export const enableBtn = (btn) => {
  btn.disabled = false;
  btn.classList.remove("inactive-btn");
  btn.classList.add("active-btn");
};

export const disableBtn = (btn) => {
  btn.disabled = true;
  btn.classList.add("inactive-btn");
  btn.classList.remove("active-btn");
};

export function checkLogin() {
  if (
    !localStorage.getItem("log") ||
    Date.now() - JSON.parse(localStorage.getItem("log")).logIn > 86400000
  ) {
    localStorage.removeItem("log");
    location.pathname = "/login.html";
  }
}

export function onBack() {
  location.pathname = "/";
}

export function logOut() {
  localStorage.removeItem("log");
  location.pathname = "/login.html";
}

export function getName() {
  const name = JSON.parse(localStorage.getItem("log")).user;
  const arr = name.split(" ");
  return arr[0];
}

export function getTask() {
  const task = localStorage.getItem("task");
  return task;
}

export function onErrorToast(message, link) {
  const texet = document.createElement("p");
  texet.insertAdjacentHTML(
    "afterbegin",
    `<a href="${link}"><div class="alert-error"><img src="${warningIcon}"/><p>${message}</p></div></a>`
  );
  Toastify({
    duration: 2000,
    node: texet,
    className: "info",
    gravity: "bottom",
    position: "center",
    stopOnFocus: false,
    style: {
      borderRadius: "15px",
      boxShadow: "rgba(0, 0, 0, 0.2) 0px 5px 15px",
      background:
        "linear-gradient(170deg,rgba(255, 255, 255, 1) 0%,rgba(245, 245, 245, 1) 100%)",
    },
  }).showToast();
}
