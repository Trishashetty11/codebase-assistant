from voice.speech_to_text import voice_to_text
from voice.text_to_speech import speak
from rag.pipeline import ask

print("Testing voice pipeline...")
print("=" * 40)

# Test text to speech first
print("TEST 1: Text to speech")
speak("Hello! I am your codebase assistant. I am ready to answer your questions.")
print("Did you hear that? Good!")

# Test full voice query
print("\nTEST 2: Voice query")
print("You have 5 seconds to ask a question about Flask...")
question = voice_to_text(duration=5)

if question:
    print(f"You asked: {question}")
    result = ask(question)
    print(f"\nAnswer: {result['answer'][:300]}...")
    speak(result['answer'][:300])
else:
    print("No audio detected")