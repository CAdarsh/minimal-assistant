import clsx from "clsx";
import "./styles/App.css";
import narrations from "./utils/narrations.json";
import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  checkForSpeechRecognitionAPI,
  initSpeechRecognition,
} from "./utils/SpeechRecognition";
import {
  pause,
  playAudio,
  generateRandomQuestion,
  preLoad,
} from "./utils/utils";
import {
  startRecording,
  stopRecording,
  initAudioRecorder,
} from "./utils/recorder";
import ErrorModal from "./components/Error";

function App() {
  const [isListening, setIsListening] = useState(false);
  const [audioChunks, setAudioChunks] = useState([]);
  const [audioRecord, setAudioRecord] = useState(false);
  const [start, setStart] = useState(false);
  const [feedback, setFeedback] = useState(null);
  const [numberAttempt, setNumberAttempt] = useState(0);
  const [speechRecognition, setSpeechRecognition] = useState(null);
  const [question, setQuestion] = useState(null);
  const [error, setError] = useState(null);
  const [audioStream, setAudioStream] = useState(null);
  const [end, setEnd] = useState(false);

  const mediaRecorder = useRef(null);

  // useCallback is used to prevent redundant initialisation of the function during any potential re-renders
  const initialiseAudioStream = useCallback(async () => {
    initAudioRecorder(setError).then((audioStream) => {
      setAudioStream(audioStream);
    });
  }, []);

  const initialiseSpeechRecognition = useCallback(async (audioStream) => {
    if (!checkForSpeechRecognitionAPI(setError)) return;
    const speechRecognition = initSpeechRecognition(setFeedback);
    speechRecognition.onstart = async () => {
      startRecording(
        audioStream,
        mediaRecorder,
        setAudioRecord,
        setAudioChunks
      );
    };
    speechRecognition.onend = () => {
      stopRecording(mediaRecorder, setAudioRecord);
      setIsListening(false);
    };
    setSpeechRecognition(speechRecognition);
  }, []);

  // the below function:
  // explains the users on how to use the assistant
  // generates and plays the question
  const Introduction = useCallback(async (question) => {
    try {
      setFeedback(narrations["Welcome"]);
      await playAudio(narrations["Welcome"]);
      await pause(3000);
      setFeedback(
        "You will now have to answer the following question with a Yes or No response"
      );
      await playAudio(narrations["Instructions"]);
      await pause(20000);
      setFeedback(question);
      await playAudio(narrations["Question"]);
      await pause(2000);
      await playAudio(question, async () => {
        await playAudio(narrations["Ready"], async () => {
          setIsListening(true);
          setFeedback("We will listen to your answer now");
        });
      });
    } catch (err) {
      if (
        err.message === "Failed to load because no supported source was found."
      ) {
        setError({
          message: "Looks like we have trouble reaching the server",
          fix: "Please ensure the server is running!",
        });
      }
    }
  }, []);

  useEffect(() => {
    initialiseAudioStream();
  }, []);

  useEffect(() => {
    if (!start) {
      initialiseSpeechRecognition(audioStream);
    }
    if (start) {
      const q = generateRandomQuestion();
      setQuestion(q);
      preLoad(q);
      Introduction(q);
    }
  }, [start, audioStream]);

  useEffect(() => {
    if (!speechRecognition) return;
    if (isListening) {
      setNumberAttempt(numberAttempt + 1);
      speechRecognition.start();
    } else {
      speechRecognition.stop();
    }
  }, [isListening]);

  useEffect(() => {
    if (!audioRecord && audioChunks.length) {
      setFeedback("Please wait, server is transcribing your response...");
      playAudio(narrations["Loading"]).then(() => {
        // this creates a blob of binary data that can be transfered to the server
        const audioBlob = new Blob(audioChunks, { type: "audio/mp3" });

        // reset audio chunks
        setAudioChunks([]);

        // Create a FormData object
        var formData = new FormData();
        formData.append("attempt", numberAttempt.toString());
        formData.append("file", audioBlob, "filename.mp3");
        formData.append("question", question);

        // Use fetch API to submit the form data
        fetch("http://localhost:8000/verify-answer/", {
          method: "POST",
          body: formData,
        })
          .then((response) => {
            if (response.ok) {
              return response.json();
            }
            throw new Error("Network response was not ok.");
          })
          .then(async (data) => {
            // update UI and respond based on the backend's response
            if (data.response === "Yes" || data.response === "No") {
              setFeedback(narrations[data.response]);
              setEnd(true);
              await playAudio(narrations[data.response], async () => {
                await playAudio(narrations["End"]);
              });
            } else {
              if (numberAttempt < 3) {
                setFeedback(
                  `You need to answer Yes or No! You have ${
                    3 - numberAttempt
                  } attempt(s) left!`
                );
                await playAudio(narrations[`UD${numberAttempt}`], () => {
                  setIsListening(true);
                });
              } else {
                setFeedback(narrations[`UD3`]);
                setEnd(true);
                await playAudio(narrations[`UD3`], async () => {
                  await playAudio(narrations["End"]);
                });
              }
            }
          })
          .catch((error) => {
            setError({
              message: error.message,
              fix: "Please check if the server is running!",
            });
          });
      });
    }
  }, [audioRecord]);

  return (
    <>
      {error && (
        <>
          <ErrorModal error={error} />
        </>
      )}
      <div className="app">
        <header className="app-header">
          <img
            className={clsx({ "shirnk-shift": start, "app-logo": true })}
            src="./mic_logo.svg"
            alt="logo"
          />
          <h1 className={clsx({ "go-up": start })}>Minimal Assistant</h1>
        </header>
        {!start ? (
          <button className="btn" onClick={() => setStart(true)}>
            Start Assistant
          </button>
        ) : (
          <>
            <>{question && <h3 className="question">Q. {question}</h3>}</>

            {feedback && (
              <>
                <div className="feedback-wrapper">
                  <h3 className="feedback"> {feedback} </h3>
                </div>
              </>
            )}

            <h3 className="status">
              Recording Status: {isListening ? "Listening..." : "Not Listening"}
            </h3>
            {end && (
              <>
                <button
                  className="btn"
                  onClick={() => window.location.reload()}
                >
                  Try Another Question
                </button>
              </>
            )}
          </>
        )}
      </div>
    </>
  );
}

export default App;
