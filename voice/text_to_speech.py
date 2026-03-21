import subprocess
import tempfile
import os
import platform

def speak(text: str):
    """
    Convert text to speech and play it.
    Uses different methods depending on OS.
    Why not Piper? It needs manual setup. This works out of the box.
    """
    system = platform.system()

    if system == "Windows":
        _speak_windows(text)
    elif system == "Darwin":
        _speak_mac(text)
    else:
        _speak_linux(text)

def _speak_windows(text: str):
    """
    Use Windows built-in text to speech.
    Why? It's already installed, no extra packages needed.
    """
    escaped = text.replace("'", "''")
    command = f"powershell -Command \"Add-Type -AssemblyName System.Speech; $s = New-Object System.Speech.Synthesis.SpeechSynthesizer; $s.Speak('{escaped}')\""
    subprocess.run(command, shell=True)

def _speak_mac(text: str):
    """Use macOS built-in say command."""
    subprocess.run(["say", text])

def _speak_linux(text: str):
    """Use espeak on Linux."""
    subprocess.run(["espeak", text])