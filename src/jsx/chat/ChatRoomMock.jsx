import { useState } from "react";
import { FaArrowUp } from "react-icons/fa"; // Font Awesome 버전 (두꺼움)
import animalIcon from "../../image/home/animal.svg"; // ✅ 임시 아바타 이미지
import "../../css/chat/ChatRoom.css";

export default function ChatRoomMock() {
  // ✅ 더미 유저 (내 계정이라고 가정)
  const currentUser = { userId: "999", name: "나" };

  const [messages] = useState([
    {
      id: "1",
      senderId: "101",
      senderName: "김멋사",
      avatar: animalIcon,
      text: "안녕하세요",
      time: "오후 10:00",
    },
    {
      id: "2",
      senderId: "101",
      senderName: "김멋사",
      avatar: animalIcon,
      text: "😄",
      time: "오후 10:01",
    },
    {
      id: "3",
      senderId: currentUser.userId,
      senderName: currentUser.name,
      text: "안녕하세요",
      time: "오후 10:05",
    },
    {
      id: "4",
      senderId: currentUser.userId,
      senderName: currentUser.name,
      text: "뭐하세여",
      time: "오후 10:13",
    },
    {
      id: "5",
      senderId: "101",
      senderName: "김멋사",
      avatar: animalIcon,
      text: "축제 구경해요",
      time: "오후 10:16",
    },
    {
      id: "6",
      senderId: "101",
      senderName: "김멋사",
      avatar: animalIcon,
      text: "어쩌구어쩌구어쩌구...ㅁㄴ아ㅐ매ㅔㄴㅇ매ㅔ아ㅐ만아ㅔㄴㅁ암내ㅔ",
      time: "오후 10:16",
    },
    {
      id: "7",
      senderId: currentUser.userId,
      senderName: currentUser.name,
      text: "😊",
      time: "오후 10:18",
    },
    {
      id: "8",
      senderId: currentUser.userId,
      senderName: currentUser.name,
      text: "어쩌구저쩌구...",
      time: "오후 10:20",
    },
  ]);

  return (
    <div className="chatroom">
      {/* 상단 헤더 */}
      <div className="chatroom-header">
        <button className="back-btn">←</button>
        <span className="title">김멋사</span>
      </div>

      {/* 메시지 영역 */}
      <div className="chatroom-messages">
        {messages.map((msg) => {
          const isMe = msg.senderId === currentUser.userId;
          return (
            <div key={msg.id} className={`chat-msg ${isMe ? "me" : "other"}`}>
              {!isMe && msg.avatar && (
                <img src={msg.avatar} alt="avatar" className="avatar" />
              )}
              <div className="bubble-wrap">
                {!isMe && msg.senderName && (
                  <div className="name">{msg.senderName}</div>
                )}
                <div className="bubble">{msg.text}</div>
                <div className="time">{msg.time}</div>
              </div>
            </div>
          );
        })}
      </div>

      {/* 입력창 */}
      <div className="chatroom-input">
        <input placeholder="메세지를 입력해주세요." />
        <button className="send-btn">
          <FaArrowUp size={20} color="white" />
        </button>{" "}
      </div>
    </div>
  );
}
