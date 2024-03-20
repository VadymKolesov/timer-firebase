import { convertMs } from "./utilites";
import { refs } from "./refs";

let watchInterval;

export const manageWatchInterval = (data) => {
  if (data.isStart) {
    watchInterval = setInterval(() => {
      const now = Date.now();
      const result = now - data.start;
      renderWatch(result);
    }, 10);
  } else if (!data.isStart) {
    clearInterval(watchInterval);
  }
};

export function renderWatch(time) {
  const { minutes, secunds, milisecunds } = convertMs(time);
  refs.watch.innerHTML = `${minutes}:${secunds},${milisecunds}`;
}
