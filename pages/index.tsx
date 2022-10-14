import Head from "next/head";
import Image from "next/image";
import Link from "next/link";
import { FormEvent, useEffect, useRef, useState, useMemo } from "react";
import Layout from "../components/layout";
import Hls from "hls.js";
import { getApp } from "firebase/app";
import {
  getAuth,
  signInWithRedirect,
  signOut,
  TwitterAuthProvider,
  User,
  getRedirectResult,
} from "firebase/auth";
import {
  getFirestore,
  doc,
  setDoc,
  addDoc,
  collection,
  serverTimestamp,
  onSnapshot,
  query,
  orderBy,
  limit,
} from "firebase/firestore";
import ChatIcon from "../components/chat-icon";

const Home = () => {
  const source = "https://live.omugi.org/live/output.m3u8";
  const [videoSrc, setVideoSrc] = useState<string | undefined>();
  const videoRef = useRef<HTMLVideoElement>(null);
  useEffect(() => {
    if (videoRef.current?.canPlayType("application/vnd.apple.mpegurl")) {
      setVideoSrc(source);
    } else if (videoRef.current && Hls.isSupported()) {
      const hls = new Hls();
      hls.loadSource(source);
      hls.attachMedia(videoRef.current);
    }
  }, [videoRef]);

  const app = useMemo(() => getApp(), []);
  const provider = new TwitterAuthProvider();
  const auth = useMemo(() => getAuth(app), [app]);
  const [user, setUser] = useState<User | null>(null);
  const db = useMemo(() => getFirestore(app), [app]);
  useEffect(() => {
    auth.onAuthStateChanged(async (user) => {
      if (user) {
        setUser(user);
      }
    });
    getRedirectResult(auth).then((result) => {
      const credintial =
        result && TwitterAuthProvider.credentialFromResult(result);
      const token = credintial?.accessToken;
      const secret = credintial?.secret;
      const user = result?.user;
      if (token && secret && user) {
        setDoc(doc(db, "users", user.uid), {
          name: user.displayName,
          photoURL: user.photoURL,
        });
        setDoc(doc(db, "users", user.uid, "privates", "twitter"), {
          token,
          secret,
        });
      }
    });
  }, [auth, db]);

  const [chatInput, setChatInput] = useState("");
  const chatSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (user !== null && chatInput !== "") {
      addDoc(collection(db, "chats"), {
        uid: user.uid,
        createdAt: serverTimestamp(),
        text: chatInput,
        name: user.displayName,
        photoURL: user.photoURL,
      });
      setChatInput("");
    }
  };
  type Chat = {
    id: string;
    uid: string;
    createdAt?: Date;
    text?: string;
    name?: string;
    photoURL?: string;
  };
  const [chats, setChats] = useState<Chat[]>([]);
  useEffect(() => {
    const q = query(
      collection(db, "chats"),
      orderBy("createdAt", "asc"),
      limit(100)
    );
    onSnapshot(q, (QuerySnapshot) => {
      setChats(
        QuerySnapshot.docs
          .map((doc) => ({
            id: doc.id,
            uid: doc.data().uid,
            createdAt: doc.data().createdAt?.toDate(),
            text: doc.data().text,
            name: doc.data().name,
            photoURL: doc.data().photoURL,
          }))
          .reverse()
      );
    });
  }, [db]);

  return (
    <Layout>
      <Head>
        <title>ウラルのゲームライブ</title>
      </Head>
      <div className="h-full min-h-screen w-full">
        <div className="m-2 text-center">ウラルのゲームライブ</div>
        <div className="sticky top-0 z-10 bg-black">
          <video
            src={videoSrc}
            ref={videoRef}
            autoPlay
            muted
            playsInline
            controls
            className="mx-auto max-h-[50vh] max-w-full"
          ></video>
        </div>
        {user ? (
          <button
            onClick={() => {
              signOut(auth).then(() => {
                setUser(null);
              });
            }}
            className="m-2 rounded bg-red-500 py-1 px-2 font-bold text-white hover:bg-red-600"
          >
            ログアウト
          </button>
        ) : (
          <button
            onClick={() => {
              signInWithRedirect(auth, provider);
            }}
            className="m-2 rounded bg-blue-500 py-2 px-4 font-bold text-white hover:bg-blue-600"
          >
            Twitterログインでチャットに参加
          </button>
        )}
        {user && <span>ユーザー名：{user.displayName}</span>}
        <div className="mx-auto max-w-3xl">
          {user && (
            <form onSubmit={chatSubmit}>
              <div className="p-2">
                <input
                  type="text"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  className="w-full rounded-md border-2 border-gray-200 p-1"
                  placeholder="チャットを入力"
                />
              </div>
            </form>
          )}
          <div>
            {chats.map((chat) => (
              <div key={chat.id} className="m-4 flex border-b-2 pb-4">
                <ChatIcon src={chat.photoURL ?? "/user.png"} />
                <div className="mx-2 flex-1">
                  <div>
                    <span className="font-bold">{chat.name}</span>{" "}
                    <span className="text-sm text-gray-400">
                      {chat.createdAt?.toLocaleString()}
                    </span>
                  </div>
                  <div>{chat.text}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Home;
