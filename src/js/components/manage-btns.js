import * as Utilites from "./utilites";
import { refs } from "./refs";

export async function manageBtns(data) {
  if (data.isReady === 0) {
    localStorage.setItem("readyID", 3);
  }

  const readyID = JSON.parse(localStorage.getItem("readyID"));

  if (data.isReady < 2 && !data.isStart && readyID !== data.isReady) {
    Utilites.enableBtn(refs.readyBtn);
    Utilites.disableBtn(refs.stopBtn);
    refs.readyContent.textContent = `I'm ready`;
  } else if (data.isReady === 2 && !data.isStart) {
    Utilites.enableBtn(refs.startBtn);
    refs.readyContent.textContent = `All users ready`;
    refs.loader.classList.add("hide-loader");
  } else if (data.isStart) {
    Utilites.enableBtn(refs.stopBtn);
    Utilites.disableBtn(refs.startBtn);
    refs.readyContent.textContent = `Timer is active`;
  } else if (!data.isStart && readyID === data.isReady) {
    refs.readyContent.textContent = `Waiting for users`;
    refs.loader.classList.remove("hide-loader");
  }
}

export async function manageBtnsDefault(data) {
  if (data.isStart) {
    Utilites.enableBtn(refs.stopBtn);
    Utilites.disableBtn(refs.startBtn);
    return;
  }

  Utilites.enableBtn(refs.startBtn);
  Utilites.disableBtn(refs.stopBtn);
}
