import { useChats } from "../hooks/use-chats";
import { useMemo } from "react";
import { getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const CommentFlow = () => {
  const app = useMemo(() => getApp(), []);
  const db = useMemo(() => getFirestore(app), [app]);
  const chats = useChats(db);

  return (
    <div>
      {chats.map((chat) => (
        <div key={chat.id}>
          <div>{chat.name}</div>
          <div>{chat.text}</div>
        </div>
      ))}
    </div>
  );
};

export default CommentFlow;
