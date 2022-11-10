import { useElapsedTime } from "../hooks/use-elapsed-time";

const ElapsedTime = ({ from }: { from: Date }) => {
  const elapsedTime = useElapsedTime(from);

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
