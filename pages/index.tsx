import Head from "next/head";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
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
import { getFirestore, doc, setDoc } from "firebase/firestore";

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

  const app = getApp();
  const provider = new TwitterAuthProvider();
  const auth = getAuth(app);
  const [user, setUser] = useState<User | null>(null);
  const db = getFirestore(app);
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

  return (
    <Layout>
      <Head>
        <title>ウラルのゲームライブ</title>
      </Head>
      <div className="h-full min-h-screen w-full">
        <video
          src={videoSrc}
          ref={videoRef}
          autoPlay
          muted
          playsInline
          controls
          className="mx-auto max-h-[50vh] max-w-full"
        ></video>
        <div className="text-center">ウラルのゲームライブ</div>
        {user ? (
          <button
            onClick={() => {
              signOut(auth).then(() => {
                setUser(null);
              });
            }}
          >
            ログアウト
          </button>
        ) : (
          <button
            onClick={() => {
              signInWithRedirect(auth, provider);
            }}
          >
            Twitterでログイン
          </button>
        )}
        {user?.photoURL && (
          <div>
            <Image src={user.photoURL} alt="" width={40} height={40} />
          </div>
        )}
        <div>{user ? `ログイン中：${user.displayName}` : "未ログイン"}</div>
      </div>
    </Layout>
  );
};

export default Home;
