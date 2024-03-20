import { getUsers } from "../service/firebase-api";
import { refs } from "./components/refs";
import { onErrorToast } from "./components/utilites";

refs.loginForm.addEventListener("submit", onLogin);
refs.loginInput.addEventListener("input", () => {
  refs.loginInput.classList.remove("login-input-required");
});

async function onLogin(e) {
  e.preventDefault();

  if (!refs.loginInput.value) {
    onErrorToast("Please, entrer a token", "#");
    refs.loginInput.classList.add("login-input-required");
    return;
  }

  const users = await getUsers();
  const token = refs.loginInput.value;

  let isTokenTrue = false;
  let userData;

  for (let user of users) {
    if (user.token === token) {
      isTokenTrue = true;
      userData = user;
      break;
    }
  }

  if (!isTokenTrue) {
    refs.loginInput.classList.add("login-input-required");
    onErrorToast("Wrong token", "#");
  } else {
    refs.loginInput.classList.remove("login-input-required");
    localStorage.setItem(
      "log",
      JSON.stringify({ ...userData, logIn: Date.now() })
    );
    location.pathname = "/index.html";
  }
}
