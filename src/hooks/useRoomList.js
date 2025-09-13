import { useEffect, useState } from "react";
import { collection, onSnapshot, orderBy, query, where } from "firebase/firestore";
import { db } from "../libs/firebase";


export default function useRoomList(myUid) {
const [rooms, setRooms] = useState([]);
const [loading, setLoading] = useState(true);


useEffect(() => {
if (!myUid) return;
const q = query(
collection(db, "rooms"),
where("memberIds", "array-contains", myUid),
orderBy("updatedAt", "desc")
);


const unsub = onSnapshot(q, (snap) => {
setRooms(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
setLoading(false);
});
return () => unsub();
}, [myUid]);


return { rooms, loading };
}