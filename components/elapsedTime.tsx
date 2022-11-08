import { useState, useEffect } from "react";

const ElapsedTime = ({ from }: { from: Date }) => {
  const [elapsedTime, setElapsedTime] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setElapsedTime(Date.now() - from.getTime());
    }, 1000);

    return () => clearInterval(interval);
  }, [from]);

  return (
    <>{`${String(Math.floor(elapsedTime / 1000 / 60 / 60)).padStart(
      2,
      "0"
    )}:${String(Math.floor(elapsedTime / 1000 / 60) % 60).padStart(
      2,
      "0"
    )}:${String(Math.floor(elapsedTime / 1000) % 60).padStart(2, "0")}`}</>
  );
};

export default ElapsedTime;
