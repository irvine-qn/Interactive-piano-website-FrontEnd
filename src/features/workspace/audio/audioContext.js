let sharedContext = null;

export const getAudioContext = () => {
  const AudioContextConstructor =
    window.AudioContext || window.webkitAudioContext;
  if (!AudioContextConstructor) {
    throw new Error("Web Audio is not supported by this browser");
  }
  if (!sharedContext || sharedContext.state === "closed") {
    sharedContext = new AudioContextConstructor();
  }
  return sharedContext;
};

export const resumeAudioContext = (onError) => {
  const context = getAudioContext();
  if (context.state === "suspended") {
    context.resume().catch((audioError) => {
      onError(`Unable to start audio: ${audioError.message}`);
    });
  }
  return context;
};
