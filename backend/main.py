from fastapi import FastAPI, File, UploadFile, Query, Form, Request
from fastapi.responses import HTMLResponse, FileResponse
from fastapi.middleware.cors import CORSMiddleware
import os
from transcribe import AudioEngine
from utils import log

# Initialise FastAPI Instance 
app = FastAPI()


origins = ["*"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# This object has member functions helping to perform transcription and synthesise audio
tts_model='studio'
te = AudioEngine(tts_model='studio')


@app.get("/", response_class=HTMLResponse)
async def main():
    content = """
                <body>
                <h1> Welcome to Minimal Assistant's Server! </h1>
                </body>
        """
    return content

# pre-loads the audio from GCP and caches it
@app.post("/load-audio")
async def load_audio(request: Request):
    request = await request.json()
    question = request["question"]
    file_path = f"./audio/{tts_model}/{te.gen_file_name_to_cache(question)}.mp3"
    
    # checks if the narration for the text is already generated and cached
    if os.path.exists(file_path):
        print(f"The file {file_path} exists.")
    else:
        te.synthesise_speech(question, file_path)
        print(f"The file {file_path} does not exist.")
    return { "response": "file_loaded" , "file": FileResponse(path=file_path, media_type='audio/mpeg', filename=file_path) }

# /audio is responsibe to systhesise narration for a given string of text  
# In production, we should consider adding authentication, rate-limiters in this route as an Open TTS endpoint can be exploited
@app.get("/audio")
async def get_audio(question: str = Query(default="Do you believe AI will do overall good for the society?")):
    file_path = f"./audio/{tts_model}/{te.gen_file_name_to_cache(question)}.mp3"
    
    # checks if the narration for the text is already generated and cached
    if os.path.exists(file_path):
        print(f"The file {file_path} exists.")
    else:
        te.synthesise_speech(question, file_path)
        print(f"The file {file_path} does not exist.")
    return FileResponse(path=file_path, media_type='audio/mpeg', filename=file_path)



@app.post("/verify-answer/")
async def verify_answer(file: UploadFile = File(...), attempt: str = Form("100"), request: Request = None, question: str = Form("")):
    if "audio" in file.content_type:
        audio_source = "audio_source." + file.filename[-3:]
        audio_content = await file.read()
        
        # binary blob is written to a temporary file
        open(audio_source, "wb").write(audio_content)
        
        result = te.transcribe_audio(audio_source)
        ip_address = request.client.host
        log(question, ip_address, result["response"], attempt)
        return result
    else:
        return "This file is not an audio file"
    
