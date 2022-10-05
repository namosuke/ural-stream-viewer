import Head from "next/head";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import Layout from "../components/layout";
import Hls from "hls.js";

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
      </div>
    </Layout>
  );
};

export default Home;
