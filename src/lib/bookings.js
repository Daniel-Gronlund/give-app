import {
  collection,
  addDoc,
  getDocs,
  query,
  where,
  orderBy,
  serverTimestamp,
  doc,
  updateDoc,
  getDoc,
} from "firebase/firestore";
import { db } from "../firebase";

const bookingsCol = collection(db, "bookings");

export async function createBooking({ item, borrowerId, borrowerName, start, end }) {
  const code = Math.random().toString(36).slice(2, 8).toUpperCase();
  const docRef = await addDoc(bookingsCol, {
    itemId: item.id,
    itemTitle: item.title,
    itemCategory: item.category,
    itemImage: item.image || null,
    itemLandingPageEnabled: !!item.landingPageEnabled,
    borrowerId,
    borrowerName,
    ownerId: item.ownerId,
    ownerName: item.ownerName,
    // participants lets us query "my bookings" (as borrower OR owner)
    // in a single Firestore query via array-contains.
    participants: [borrowerId, item.ownerId],
    status: "pending",
    code,
    rawStart: start.toISOString(),
    rawEnd: end.toISOString(),
    handoverAt: null,
    handoverMethod: null,
    returnAt: null,
    createdAt: serverTimestamp(),
  });
  return docRef.id;
}

export async function fetchBookingsForUser(uid) {
  const q = query(bookingsCol, where("participants", "array-contains", uid), orderBy("createdAt", "desc"));
  const snapshot = await getDocs(q);
  return snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
}

export async function fetchBookingsForItem(itemId) {
  const q = query(bookingsCol, where("itemId", "==", itemId));
  const snapshot = await getDocs(q);
  return snapshot.docs.map((d) => ({ id: d.id, ...d.data() })).filter((b) => b.status !== "returned");
}

export async function fetchBooking(id) {
  const snap = await getDoc(doc(db, "bookings", id));
  return snap.exists() ? { id: snap.id, ...snap.data() } : null;
}

export async function updateBooking(id, data) {
  await updateDoc(doc(db, "bookings", id), data);
}
