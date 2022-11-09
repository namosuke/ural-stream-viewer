import { useState, useEffect } from "react";
import {
  collection,
  onSnapshot,
  query,
  orderBy,
  limit,
  Firestore,
} from "firebase/firestore";

export type Chat = {
  id: string;
  uid: string;
  createdAt?: Date;
  text?: string;
  name?: string;
  photoURL?: string;
};

export const useChats = (db: Firestore) => {
  const [chats, setChats] = useState<Chat[]>([]);

  useEffect(() => {
    const q = query(
      collection(db, "chats"),
      orderBy("createdAt", "desc"),
      limit(100)
    );
    onSnapshot(q, (QuerySnapshot) => {
      setChats(
        QuerySnapshot.docs.map((doc) => ({
          id: doc.id,
          uid: doc.data().uid,
          createdAt: doc.data().createdAt?.toDate(),
          text: doc.data().text,
          name: doc.data().name,
          photoURL: doc.data().photoURL,
        }))
      );
    });
  }, [db]);

  return chats;
};
