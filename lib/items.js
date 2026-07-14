import {
  collection,
  addDoc,
  getDocs,
  query,
  orderBy,
  serverTimestamp,
  doc,
  updateDoc,
  deleteDoc,
  where,
} from "firebase/firestore";
import { db } from "../firebase";

const itemsCol = collection(db, "items");

export async function createItem(data, ownerId, ownerName) {
  const docRef = await addDoc(itemsCol, {
    ...data,
    ownerId,
    ownerName,
    createdAt: serverTimestamp(),
  });
  return docRef.id;
}

export async function fetchItems() {
  const q = query(itemsCol, orderBy("createdAt", "desc"));
  const snapshot = await getDocs(q);
  return snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
}

export async function fetchItemsByOwner(ownerId) {
  const q = query(itemsCol, where("ownerId", "==", ownerId), orderBy("createdAt", "desc"));
  const snapshot = await getDocs(q);
  return snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
}

export async function updateItem(id, data) {
  await updateDoc(doc(db, "items", id), data);
}

export async function deleteItem(id) {
  await deleteDoc(doc(db, "items", id));
}
