import constants from "./constants";
import narrations from "./narrations.json";

// helper function to add query params to the audio end point;
export function createAudioURL(caption) {
  const audioURL = new URL(`${constants.BACKEND_ENDPOINT}/audio`);
  audioURL.searchParams.append("question", caption);
  return audioURL.href;
}

export function pause(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// Attempt to play the new audio
export function playAudio(audioURL, callback = null) {
  const audio = new Audio(createAudioURL(audioURL));
  if (callback) {
    audio.addEventListener("ended", () => {
      callback();
    });
  }
  return audio.play();
}

export function generateRandomQuestion() {
  const qNo = Math.floor(Math.random() * constants.NUMBER_OF_QUESTIONS) + 1;
  return narrations[`Q${qNo}`];
}

export function preLoad(question) {
  // Define the URL of the API endpoint
  const url = `${constants.BACKEND_ENDPOINT}/load-audio`;

  // Define the data you want to send
  const payload = {
    question,
  };

  // Create a fetch request
  fetch(url, {
    method: "POST", // Specify the request method
    headers: {
      // Specify any needed headers
      // This is important for sending JSON data
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload), // Convert the JavaScript object to a JSON string
  })
    .then((response) => response.json()) // Convert the response to JSON
    .then((data) => {
      console.log("Success:", data);
    })
    .catch((error) => {
      console.error("Error:", error);
    });
}
