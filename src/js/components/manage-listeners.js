import {
  getData,
  setData,
  getStepsList,
  addStepToList,
} from "../../../service/firebase-api";
import * as Utilites from "./utilites";
import { refs } from "./refs";
import { nanoid } from "nanoid";

export async function setReady() {
  const data = await getData();
  if (data.isReady < 2) {
    const newReadyID = data.isReady + 1;
    localStorage.setItem("readyID", newReadyID);
    Utilites.disableBtn(refs.readyBtn);
    setData({
      ...data,
      isReady: newReadyID,
    });
  }
}

export async function onStart() {
  const data = await getData();
  const startDate = Date.now();
  setData({
    ...data,
    isStart: true,
    start: startDate,
  });
}

export async function onStop() {
  const data = await getData();
  const stepsList = await getStepsList();

  const stopDate = Date.now();
  const stepNum = stepsList.items.length > 0 ? stepsList.items.length + 1 : 1;
  const seconds = (stopDate - data.start) / 1000;

  const newStepItem = {
    id: nanoid(),
    step: stepNum,
    time: seconds,
  };

  addStepToList(newStepItem);

  setData({
    ...data,
    isReady: 0,
    isStart: false,
    stop: stopDate,
  });
}
