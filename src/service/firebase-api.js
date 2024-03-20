import { initializeApp } from "firebase/app";
import { getDatabase, ref, child, get, set } from "firebase/database";
import {
  doc,
  onSnapshot,
  getFirestore,
  setDoc,
  getDoc,
  getDocs,
  collection,
} from "firebase/firestore";
import firebaseConfig from "./firebase-config";
import { db } from "./database";
import { manageBtns, manageBtnsDefault } from "../js/components/manage-btns";
import { manageWatchInterval } from "../js/components/watch";
import { showUsers } from "/src/js/components/manage-users";
import { renderStepsList } from "/src/js/components/render-steps-list";

export async function getFirebaseData() {
  const dbRef = ref(getDatabase());
  const data = await get(child(dbRef, `timer/`))
    .then((snapshot) => {
      if (snapshot.exists()) {
        return snapshot.val();
      } else {
        console.log("No data available");
      }
    })
    .catch((error) => {
      console.error(error);
    });
  return data;
}

export function writeData(data) {
  const db = getDatabase();
  set(ref(db, "timer/"), data);
}

export async function checkList() {
  const app = initializeApp(firebaseConfig);
  const db = getFirestore(app);
  onSnapshot(doc(db, "list", "Oi4nFSVsaGY2GQtak5IO"), (doc) => {
    const data = doc.data().items.reverse();
    console.log(data);
  });
}

export function checkData() {
  const app = initializeApp(firebaseConfig);
  const db = getFirestore(app);
  onSnapshot(doc(db, "data", "GKpJfJAhEovC4aEqzc9C"), (doc) => {
    const data = doc.data();
    manageBtns(data);
    showUsers(data);
    manageWatchInterval(data);
  });
}

export async function getData() {
  const docRef = doc(db, "data", "GKpJfJAhEovC4aEqzc9C");
  const data = await getDoc(docRef);
  return data.data();
}

export async function setData(data) {
  const docRef = await setDoc(doc(db, "data", "GKpJfJAhEovC4aEqzc9C"), {
    ...data,
  });
}

export async function getStepsList() {
  const docRef = doc(db, "list", "Oi4nFSVsaGY2GQtak5IO");
  const data = await getDoc(docRef);
  return data.data();
}

export async function addStepToList(data) {
  const prevList = await getStepsList();
  setDoc(doc(db, "list", "Oi4nFSVsaGY2GQtak5IO"), {
    items: [...prevList.items, data],
  });
}

export function checkDefaultData() {
  const app = initializeApp(firebaseConfig);
  const db = getFirestore(app);
  onSnapshot(doc(db, "data", "Default"), (doc) => {
    const data = doc.data();
    manageBtnsDefault(data);
    manageWatchInterval(data);
  });
}

export async function checkDefaultList() {
  const app = initializeApp(firebaseConfig);
  const db = getFirestore(app);
  onSnapshot(doc(db, "list", "Default"), (doc) => {
    const data = doc.data().items.reverse();
    console.log(data);
    renderStepsList(data);
  });
}

export async function getDefaultData() {
  const docRef = doc(db, "data", "Default");
  const data = await getDoc(docRef);
  return data.data();
}

export async function setDefaultData(data) {
  const docRef = await setDoc(doc(db, "data", "Default"), {
    ...data,
  });
}

export async function getDefaultStepsList() {
  const docRef = doc(db, "list", "Default");
  const data = await getDoc(docRef);
  return data.data();
}

export async function addDefaultStepToList(data) {
  const prevList = await getDefaultStepsList();
  setDoc(doc(db, "list", "Default"), {
    items: [...prevList.items, data],
  });
}

export async function deleteDefaultStepById(id) {
  const prevList = await getDefaultStepsList();
  const newList = prevList.items.filter((el) => el.id !== id);

  for (let i = 0; i < newList.length; i++) {
    if (i === 0) {
      newList.step === 1;
    }

    newList[i].step = i + 1;
  }

  setDoc(doc(db, "list", "Default"), {
    items: newList,
  });
}

export async function resetDefaultStepList(data) {
  const prevList = await getDefaultStepsList();
  setDoc(doc(db, "list", "Default"), {
    items: [],
  });
}

export async function getUsers() {
  const docRef = doc(db, "users", "tokens");
  const data = await getDoc(docRef);
  return data.data().data;
}
