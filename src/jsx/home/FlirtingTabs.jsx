// src/jsx/home/FlirtingTabs.jsx
import React, { useState, useEffect } from "react";
import "../../css/home/FlirtingTabs.css";
import SentSignalList from "./SentSignalList";
import ReceiveSignal from "./ReceiveSignal";
import Accept from "./Accept";
import Modal from "../common/Modal";
import YouProfile from "../mypage/YouProfile";
import api from "../../api/axios.js";

export default function FlirtingTabs() {
  const [activeTab, setActiveTab] = useState("sent");
  const [sentSignals, setSentSignals] = useState([]);
  const [receivedSignals, setReceivedSignals] = useState([]);
  const [openModal, setOpenModal] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [openProfile, setOpenProfile] = useState(false);

  useEffect(() => {
    fetchSentSignals();
    fetchReceivedSignals();
  }, []);

  const fetchSentSignals = async () => {
    try {
      const resp = await api.get("/signals/sent");
      setSentSignals(resp.data || []);
    } catch (err) {
      console.error("❌ 보낸 신호 불러오기 실패:", err);
    }
  };

  const fetchReceivedSignals = async () => {
    try {
      const resp = await api.get("/signals/received");
      setReceivedSignals(resp.data || []);
    } catch (err) {
      console.error("❌ 받은 신호 불러오기 실패:", err);
    }
  };

  const acceptSignal = async (signalId) => {
    try {
      await api.post(`/signals/accept/${signalId}`);
      fetchReceivedSignals();
      setOpenModal(false);
    } catch (err) {
      console.error("❌ 신호 수락 실패:", err);
    }
  };

  const declineSignal = async (signalId) => {
    try {
      await api.post(`/signals/decline/${signalId}`);
      fetchReceivedSignals();
    } catch (err) {
      console.error("❌ 신호 거절 실패:", err);
    }
  };

  // ✅ 공통 프로필 열기 함수
  const handleOpenProfile = (userId) => {
    setSelectedUserId(userId);
    setOpenProfile(true);
  };

  return (
    <div className="flirting-tabs">
      {/* 상단 탭 */}
      <div className="tab-header">
        <button
          className={`tab-btn ${activeTab === "sent" ? "active" : ""}`}
          onClick={() => setActiveTab("sent")}
        >
          내가 보낸 플러팅
        </button>
        <button
          className={`tab-btn ${activeTab === "received" ? "active" : ""}`}
          onClick={() => setActiveTab("received")}
        >
          나에게 온 플러팅
        </button>
      </div>

      {/* 컨텐츠 */}
      <div className={`tab-content ${activeTab}-tab`}>
        {activeTab === "sent" ? (
          <SentSignalList signals={sentSignals} onOpenProfile={handleOpenProfile} />
        ) : (
          <ReceiveSignal
            signals={receivedSignals}
            onAccept={(id) =>
              setOpenModal(receivedSignals.find((s) => s.signalId === id))
            }
            onReject={declineSignal}
            onOpenProfile={handleOpenProfile}
          />
        )}
      </div>

      {/* 수락 모달 */}
      {openModal && (
        <Accept
          open={true}
          onClose={() => setOpenModal(false)}
          onAccept={() => acceptSignal(openModal.signalId)}
          onReject={() => declineSignal(openModal.signalId)}
          user={{
            name: openModal.fromUser?.name,
            department: openModal.fromUser?.department,
            avatar: openModal.fromUser?.typeImageUrl2 || "",
            createdAt: openModal.createdAt,
          }}
        />
      )}

      {/* 프로필 모달 */}
      {openProfile && (
        <Modal onClose={() => setOpenProfile(false)}>
          <YouProfile userId={selectedUserId} />
        </Modal>
      )}
    </div>
  );
}
