import whisper
import sounddevice as sd
import soundfile as sf
import tempfile
import os

model = None

def load_whisper_model():
    global model
    if model is None:
        print("Loading Whisper model...")
        model = whisper.load_model("base")
        print("Whisper model loaded!")
    return model

def record_audio(duration: int = 5, sample_rate: int = 16000) -> str:
    """
    Record audio from microphone for given duration.
    Returns path to saved audio file.
    Why 16000hz? Whisper was trained on 16khz audio — matches perfectly.
    """
    print(f"Recording for {duration} seconds... speak now!")
    audio = sd.rec(
        int(duration * sample_rate),
        samplerate=sample_rate,
        channels=1,
        dtype='float32'
    )
    sd.wait()
    print("Recording done!")

    tmp = tempfile.NamedTemporaryFile(suffix=".wav", delete=False)
    sf.write(tmp.name, audio, sample_rate)
    return tmp.name

def transcribe_audio(audio_path: str) -> str:
    """
    Convert audio file to text using Whisper.
    Why Whisper? It's free, runs locally, very accurate.
    """
    stt_model = load_whisper_model()
    print("Transcribing audio...")
    result = stt_model.transcribe(audio_path)
    text = result["text"].strip()
    print(f"Transcribed: {text}")
    try:
        os.unlink(audio_path)
    except Exception:
        pass
    return text

def voice_to_text(duration: int = 5) -> str:
    """Record microphone and return transcribed text."""
    audio_path = record_audio(duration)
    return transcribe_audio(audio_path)