import { useEffect, useRef, useState } from "react";
import { collection, getDocs, limit, onSnapshot, orderBy, query, startAfter } from "firebase/firestore";
import { db } from "../libs/firebase";


export default function useRoomMessages(roomId, pageSize = 30) {
const [messages, setMessages] = useState([]);
const [loading, setLoading] = useState(true);
const cursorRef = useRef(null);


useEffect(() => {
if (!roomId) return;
const base = collection(db, "rooms", roomId, "messages");
const q = query(base, orderBy("createdAt", "desc"), limit(pageSize));


const unsub = onSnapshot(q, (snap) => {
const docs = snap.docs;
cursorRef.current = docs[docs.length - 1] || null;
const list = docs.map((d) => ({ id: d.id, ...d.data() })).reverse();
setMessages(list);
setLoading(false);
});
return () => unsub();
}, [roomId, pageSize]);


const loadMore = async () => {
if (!roomId || !cursorRef.current) return [];
const base = collection(db, "rooms", roomId, "messages");
const q = query(base, orderBy("createdAt", "desc"), startAfter(cursorRef.current), limit(pageSize));
const snap = await getDocs(q);
cursorRef.current = snap.docs[snap.docs.length - 1] || null;
const more = snap.docs.map((d) => ({ id: d.id, ...d.data() })).reverse();
setMessages((prev) => [...more, ...prev]);
return more;
};


return { messages, loading, loadMore };
}