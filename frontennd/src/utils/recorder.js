export async function startRecording(
  audioStream,
  mediaRecorder,
  setAudioRecord,
  setAudioChunks
) {
  setAudioRecord(true);
  if (!audioStream) return;
  // MediaRecorder creates a MediaStream object
  const media = new MediaRecorder(audioStream, { type: "audio/mp3" });

  mediaRecorder.current = media;

  // starts recording
  mediaRecorder.current.start();

  let localAudioChunks = [];

  mediaRecorder.current.ondataavailable = (event) => {
    if (typeof event.data === "undefined") return;
    if (event.data.size === 0) return;

    localAudioChunks.push(event.data);

    // chunks of audio is appended to be used later
    setAudioChunks(localAudioChunks);
  };
}

// prompt users for permission
export async function initAudioRecorder(setError) {
  if ("MediaRecorder" in window) {
    try {
      const streamData = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: false,
      });
      return streamData;
    } catch (err) {
      if (err.message === "Permission denied")
        setError({
          message: "Audio Permission Denied",
          fix: "Please allow the site to record audio",
        });
    }
  } else {
    setError("The MediaRecorder API is not supported in your browser.");
  }
}

// stops the mediaRecorder object
export function stopRecording(mediaRecorder, setAudioRecord) {
  if (mediaRecorder.current) {
    mediaRecorder.current.stop();
    mediaRecorder.current.onstop = () => {
      setAudioRecord(false);
    };
  }
}
