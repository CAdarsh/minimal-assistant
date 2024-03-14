// Checks for browser compatability
export function checkForSpeechRecognitionAPI(setError) {
  let speechRecognitionSupported =
    "SpeechRecognition" in window || "webkitSpeechRecognition" in window;
  if (!speechRecognitionSupported)
    setError({
      message: "Speech Recognition API Not Supported",
      fix: "Please use either Google Chrome, Safari or Microsoft Edge to run the assistant",
    });
  return !!speechRecognitionSupported;
}

// Initialises Web Speech Recognition APIs
export function initSpeechRecognition(setTranscript) {
  const recognition = new window.webkitSpeechRecognition();
  recognition.continuous = false;
  recognition.interimResults = true;
  recognition.lang = "en-US";
  return recognition;
}
