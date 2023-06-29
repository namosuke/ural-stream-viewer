import { useChats } from "../hooks/use-chats";
import { useMemo, useState, useEffect } from "react";
import { getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import ChatIcon from "../components/chat-icon";

const ChatStream = () => {
  const app = useMemo(() => getApp(), []);
  const db = useMemo(() => getFirestore(app), [app]);
  const chats = useChats(db);
  const displaySeconds = 10;
  type ChatToLane = {
    [chatId: string]: number;
  };
  const [chatToLane, setChatToLane] = useState<ChatToLane>({});

  useEffect(() => {
    setChatToLane((prev) => {
      const newChatToLane: ChatToLane = {};
      const lanes = new Array(10).fill(0);
      // 更新前レーン集計
      Object.entries(prev).forEach(([chatId, lane]) => {
        const chat = chats.find((chat) => chat.id === chatId);
        if (
          chat?.createdAt &&
          Date.now() - chat.createdAt.getTime() < displaySeconds * 1000
        ) {
          lanes[lane] += 1;
        }
      });
      chats
        .filter(
          (chat) =>
            chat.createdAt &&
            Date.now() - chat.createdAt.getTime() < displaySeconds * 1000
        )
        .forEach((chat) => {
          if (prev[chat.id] !== undefined) {
            newChatToLane[chat.id] = prev[chat.id];
          } else {
            // レーンが空いているものを優先して割り当てる
            const lane = lanes.indexOf(Math.min(...lanes));
            lanes[lane] += 1;
            newChatToLane[chat.id] = lane;
          }
        });
      return newChatToLane;
    });
  }, [chats]);

  return (
    <div
      className="relative h-[720px] w-[1280px] overflow-hidden whitespace-nowrap text-6xl font-bold text-white"
      style={{
        textShadow:
          "0 0 4px #000000, 0 0 4px #000000, 0 0 4px #000000, 0 0 4px #000000",
      }}
    >
      <style>
        {`@keyframes chatStream {
            to {
              transform: translateX(calc(-100%));
            }
          }`}
      </style>
      {chats
        .filter(
          (chat) =>
            chat.createdAt &&
            Date.now() - chat.createdAt.getTime() < displaySeconds * 1000
        )
        .map((chat) => (
          <div
            key={chat.id}
            className="absolute flex items-center"
            style={{
              top: (chatToLane[chat.id] ?? -1) * 70,
              // 10秒以内のコメントがすべて右端から出るが仕様
              transform: `translateX(1280px)`,
              animationDuration: `${displaySeconds}s`,
              animationName: "chatStream",
              animationTimingFunction: "linear",
              animationFillMode: "both",
              transformBox: "fill-box",
            }}
          >
            <ChatIcon src={"/user.png"} size={70} />
            <div className="ml-4 mr-1">{chat.text}</div>
          </div>
        ))}
    </div>
  );
};

export default ChatStream;
