import { refs } from "./src/js/components/refs";
import { checkLogin, logOut, onBack } from "./src/js/components/utilites";

checkLogin();

refs.logOutBtn.addEventListener("click", logOut);
refs.navName.innerHTML = JSON.parse(localStorage.getItem("log")).user;
