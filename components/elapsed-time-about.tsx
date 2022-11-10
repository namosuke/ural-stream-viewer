import { useElapsedTime } from "../hooks/use-elapsed-time";

const ElapsedTimeAbout = ({ from }: { from: Date }) => {
  const elapsedTime = useElapsedTime(from);

  return (
    <>
      {elapsedTime > 1000 * 60 * 60 * 24
        ? `${Math.floor(elapsedTime / 1000 / 60 / 60 / 24)}時間`
        : elapsedTime > 1000 * 60 * 60
        ? `${Math.floor(elapsedTime / 1000 / 60 / 60) % 24}時間`
        : elapsedTime > 1000 * 60
        ? `${Math.floor(elapsedTime / 1000 / 60) % 60}分`
        : `${Math.floor(elapsedTime / 1000) % 60}秒`}
    </>
  );
};

export default ElapsedTimeAbout;
