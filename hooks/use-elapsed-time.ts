import { useState, useEffect } from "react";

export const useElapsedTime = (from: Date, interval: number = 1000) => {
  const [elapsedTime, setElapsedTime] = useState(0);

  useEffect(() => {
    setElapsedTime(Date.now() - from.getTime());

    const intervalTimer = setInterval(() => {
      setElapsedTime(Date.now() - from.getTime());
    }, interval);

    return () => clearInterval(intervalTimer);
  }, [from, interval]);

  return elapsedTime;
};
