import { collection, doc, increment, serverTimestamp, writeBatch } from "firebase/firestore";
import { db } from "../libs/firebase";


export async function sendMessage({ roomId, text, myUid, otherUid }) {
if (!text?.trim()) return;
const roomRef = doc(db, "rooms", roomId);
const msgRef = doc(collection(roomRef, "messages"));
const otherMemberRef = doc(db, "rooms", roomId, "members", otherUid);


const batch = writeBatch(db);
batch.set(msgRef, {
text: text.trim(),
senderId: myUid,
createdAt: serverTimestamp(),
status: "sent",
});
batch.update(roomRef, {
lastMessage: { text: text.trim(), senderId: myUid, createdAt: serverTimestamp() },
updatedAt: serverTimestamp(),
});
batch.update(otherMemberRef, { unreadCount: increment(1) });


await batch.commit();
}


export async function markAsRead({ roomId, myUid }) {
const meRef = doc(db, "rooms", roomId, "members", myUid);
const batch = writeBatch(db);
batch.update(meRef, { lastReadAt: serverTimestamp(), unreadCount: 0 });
await batch.commit();
}