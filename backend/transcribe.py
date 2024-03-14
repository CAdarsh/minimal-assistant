import whisper
import hashlib
from google.cloud import texttospeech
import torch

"""Synthesizes speech from the input string of text or ssml.
Make sure to be working in a virtual environment.

Note: ssml must be well-formed according to:
    https://www.w3.org/TR/speech-synthesis/
"""

class AudioEngine():
    def __init__(self, tts_model: str) -> None:
        # load whisper model
        # Whisper also offers larger models with superior accuracy. Please check: https://github.com/openai/whisper for more info  
        model = "small.en"
        # model = "medium.en" if torch.cuda.is_available() else "small.en"
        self.model = whisper.load_model(model)     
        self.tts_model = tts_model

    def evaluate_transcription(self, speech: str):
        processed_text = ''.join([i.lower() for i in speech if i.isalpha()]) # removes punctuation marks picked up during translation
        if processed_text not in ['yes', 'no']:
            return "Invalid Response"
        else:
            return processed_text.title()

    def transcribe_audio(self, audio_source):
        transcription = self.model.transcribe(audio_source)
        return { "response": self.evaluate_transcription(transcription["text"]), "transcription": transcription["text"]}
    
    def gen_file_name_to_cache(self, name) -> bool:
        # Write logic
        hash_object = hashlib.sha256(name.encode('utf-8'))
        hex_dig = hash_object.hexdigest()  # Convert the hash object to a hexadecimal representation
        return hex_dig
    
    def synthesise_speech(self, text: str, file_path: str) -> str:

        print("API Called")
        # Instantiates a client
        client = texttospeech.TextToSpeechClient()

        # Set the text input to be synthesized
        synthesis_input = texttospeech.SynthesisInput(text=text)

        if self.tts_model == "studio":
            # Build the voice request, select the language code ("en-US") and the ssml
            # voice gender ("neutral")
            voice = texttospeech.VoiceSelectionParams(
                language_code="en-US", 
                name="en-US-Studio-O"
            )
        
        else:
            # Build the voice request, select the language code ("en-US") and the ssml
            # voice gender ("neutral")
            voice = texttospeech.VoiceSelectionParams(
                language_code="en-US", 
                    # name="en-US-Studio-O"
            )
        

        # Select the type of audio file you want returned
        audio_config = texttospeech.AudioConfig(
            audio_encoding=texttospeech.AudioEncoding.LINEAR16
        )

        # Perform the text-to-speech request on the text input with the selected
        # voice parameters and audio file type
        response = client.synthesize_speech(
            input=synthesis_input, voice=voice, audio_config=audio_config
        )

        # The response's audio_content is binary.
        with open(file_path, "wb") as out:
            # Write the response to the output file.
            out.write(response.audio_content)
            print(f'Audio content written to file "{file_path}"')

