import { refs } from "./refs";
import checkIcon from "../../icons/check.svg";

export function showUsers(data) {
  const readyID = JSON.parse(localStorage.getItem("readyID"));
  const readyMessages = document.querySelectorAll(".user");

  if (data.isStart || data.isReady === 2) {
    refs.readyUsers.innerHTML = "";
    return;
  } else if (
    data.isReady === 1 &&
    readyMessages.length <= 1 &&
    readyID !== data.isReady
  ) {
    refs.readyUsers.insertAdjacentHTML(
      "afterbegin",
      `<li class="user"><img src="${checkIcon}" class="check-icon" /><p class="ready-message">First user is ready.</p></li>`
    );
    refs.readyUsers.firstElementChild.classList.add("user-visible");
  }
}
