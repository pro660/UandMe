import { signInWithCustomToken } from "firebase/auth";
import { auth } from "../libs/firebase";


export async function loginFirebaseWithCustomToken(myUserId) {
// TODO: 네 백엔드의 실제 URL로 교체
const resp = await fetch("/auth/firebase-token", {
method: "POST",
headers: { "Content-Type": "application/json" },
credentials: "include",
body: JSON.stringify({ userId: myUserId }),
});
if (!resp.ok) throw new Error("Failed to fetch custom token");
const { token } = await resp.json();
await signInWithCustomToken(auth, token);
}