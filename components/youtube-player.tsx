export const YoutubePlayer = () => {
  return (
    <div
      className="mx-auto max-h-[50vh] max-w-full"
      style={{
        aspectRatio: "16/9",
      }}
    >
      <iframe
        className="h-full w-full"
        width="560"
        height="315"
        src="https://www.youtube.com/embed/wEQ-EMrsYUM"
        title="YouTube video player"
        frameBorder="0"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        allowFullScreen
      />
    </div>
  );
};
