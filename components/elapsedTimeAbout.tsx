import { useState, useEffect } from "react";

const ElapsedTimeAbout = ({ from }: { from: Date }) => {
  const [elapsedTime, setElapsedTime] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setElapsedTime(Date.now() - from.getTime());
    }, 1000);

    return () => clearInterval(interval);
  }, [from]);

  return (
    <>
      {elapsedTime > 1000 * 60 * 60
        ? `${Math.floor(elapsedTime / 1000 / 60 / 60)}時間`
        : elapsedTime > 1000 * 60
        ? `${Math.floor(elapsedTime / 1000 / 60) % 60}分`
        : `${Math.floor(elapsedTime / 1000) % 60}秒`}
    </>
  );
};

export default ElapsedTimeAbout;
