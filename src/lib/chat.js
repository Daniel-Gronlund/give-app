import {
  collection,
  doc,
  setDoc,
  addDoc,
  query,
  where,
  orderBy,
  onSnapshot,
  serverTimestamp,
  updateDoc,
  getDocs,
} from "firebase/firestore";
import { db } from "../firebase";

const conversationsCol = collection(db, "conversations");

// Deterministic conversation id: same two people + same item always land
// in the same thread, whoever starts it.
function conversationId(itemId, uidA, uidB) {
  const [a, b] = [uidA, uidB].sort();
  return `${itemId}_${a}_${b}`;
}

export async function getOrCreateConversation({ itemId, itemTitle, itemImage, currentUser, otherUserId, otherUserName }) {
  const id = conversationId(itemId, currentUser.uid, otherUserId);
  const ref = doc(db, "conversations", id);
  // Using setDoc(..., {merge:true}) instead of getDoc()-then-setDoc avoids
  // needing read permission on a conversation that doesn't exist yet — the
  // security rules only let you read a conversation you're already a
  // participant of, which a brand-new document can't satisfy.
  await setDoc(
    ref,
    {
      itemId,
      itemTitle,
      itemImage: itemImage || null,
      participants: [currentUser.uid, otherUserId],
      participantNames: {
        [currentUser.uid]: currentUser.displayName || currentUser.email,
        [otherUserId]: otherUserName,
      },
      lastMessageAt: serverTimestamp(),
    },
    { merge: true }
  );
  return id;
}

export async function fetchConversationsForUser(uid) {
  const q = query(conversationsCol, where("participants", "array-contains", uid), orderBy("lastMessageAt", "desc"));
  const snapshot = await getDocs(q);
  return snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
}

export function subscribeToConversation(conversationId, callback) {
  return onSnapshot(doc(db, "conversations", conversationId), (snap) => {
    if (snap.exists()) callback({ id: snap.id, ...snap.data() });
  });
}

export function subscribeToMessages(conversationId, callback) {
  const messagesCol = collection(db, "conversations", conversationId, "messages");
  const q = query(messagesCol, orderBy("createdAt", "asc"));
  return onSnapshot(q, (snapshot) => {
    callback(snapshot.docs.map((d) => ({ id: d.id, ...d.data() })));
  });
}

export async function sendMessage(conversationId, senderId, text) {
  const messagesCol = collection(db, "conversations", conversationId, "messages");
  await addDoc(messagesCol, {
    senderId,
    text,
    createdAt: serverTimestamp(),
  });
  await updateDoc(doc(db, "conversations", conversationId), {
    lastMessage: text,
    lastMessageAt: serverTimestamp(),
  });
}
