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

const Home = () => {
  const source = "https://live.omugi.org/live/output.m3u8";
  const [videoSrc, setVideoSrc] = useState<string | undefined>();
  const videoRef = useRef<HTMLVideoElement>(null);
  useEffect(() => {
    if (videoRef.current?.canPlayType("application/vnd.apple.mpegurl")) {
      console.log("Using native HLS");
      setVideoSrc(source);
    } else if (videoRef.current && Hls.isSupported()) {
      console.log("Using hls.js");
      const hls = new Hls();
      hls.loadSource(source);
      hls.attachMedia(videoRef.current);
    }
  }, [videoRef]);

  const app = getApp();
  const provider = new TwitterAuthProvider();
  const auth = getAuth(app);
  const [user, setUser] = useState<User | null>(null);
  useEffect(() => {
    auth.onAuthStateChanged(async (user) => {
      if (user) {
        setUser(user);
      }
    });
  }, [auth]);

  return (
    <Layout>
      <Head>
        <title>ウラルのゲーム部屋</title>
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
        <div className="text-center">ウラルのゲーム部屋</div>
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
