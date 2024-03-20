import * as FirebaseApi from "/service/firebase-api";
import * as ManageListeners from "./components/manage-listeners";
import { refs } from "./components/refs";
import { checkLogin } from "./components/utilites";

checkLogin();

refs.readyBtn.addEventListener("click", ManageListeners.setReady);
refs.startBtn.addEventListener("click", ManageListeners.onStart);
refs.stopBtn.addEventListener("click", ManageListeners.onStop);

FirebaseApi.checkData();
FirebaseApi.checkList();
