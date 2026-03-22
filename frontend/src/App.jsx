import { useState, useRef, useEffect } from "react"
import axios from "axios"

const API = "http://127.0.0.1:8000"

export default function App() {
  const [repoUrl, setRepoUrl] = useState("")
  const [indexing, setIndexing] = useState(false)
  const [indexed, setIndexed] = useState(false)
  const [question, setQuestion] = useState("")
  const [messages, setMessages] = useState([])
  const [loading, setLoading] = useState(false)
  const [chunks, setChunks] = useState(0)
  const [repoName, setRepoName] = useState("")
  const [recording, setRecording] = useState(false)
  const messagesEndRef = useRef(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const indexRepo = async () => {
    if (!repoUrl) return
    setIndexing(true)
    const name = repoUrl.split("/").slice(-2).join("/")
    setRepoName(name)
    try {
      const res = await axios.post(`${API}/index_repo`, { repo_url: repoUrl })
      setChunks(res.data.chunks)
      setIndexed(true)
      setMessages([{
        role: "assistant",
        text: `Successfully indexed ${name}. I've processed ${res.data.chunks} code chunks and I'm ready to answer your questions!`,
        sources: []
      }])
    } catch (e) {
      alert("Error indexing repo: " + e.message)
    }
    setIndexing(false)
  }

  const sendQuestion = async () => {
    if (!question.trim()) return
    const userMsg = { role: "user", text: question, sources: [] }
    setMessages(prev => [...prev, userMsg])
    setQuestion("")
    setLoading(true)
    try {
      const res = await axios.post(`${API}/query`, { question })
      setMessages(prev => [...prev, {
        role: "assistant",
        text: res.data.answer,
        sources: res.data.sources
      }])
    } catch (e) {
      setMessages(prev => [...prev, {
        role: "assistant",
        text: "Something went wrong. Make sure the API server is running.",
        sources: []
      }])
    }
    setLoading(false)
  }

 const handleKey = (e) => {
  if (e.key === "Enter" && !e.shiftKey) {
    e.preventDefault()
    sendQuestion()
  }
}
const startVoice = async () => {
  setRecording(true)
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
    const recorder = new MediaRecorder(stream)
    const audioChunks = []
    recorder.ondataavailable = e => audioChunks.push(e.data)
    recorder.onstop = async () => {
      const blob = new Blob(audioChunks, { type: "audio/wav" })
      const formData = new FormData()
      formData.append("audio", blob, "query.wav")
      setLoading(true)
      try {
        const res = await axios.post(`${API}/voice_query`, formData)
        setMessages(prev => [...prev,
          { role: "user", text: res.data.question, sources: [] },
          { role: "assistant", text: res.data.answer, sources: res.data.sources }
        ])
      } catch (e) {
        setMessages(prev => [...prev, {
          role: "assistant",
          text: "Voice query failed: " + e.message,
          sources: []
        }])
      }
      setLoading(false)
      stream.getTracks().forEach(t => t.stop())
    }
    recorder.start()
    setTimeout(() => recorder.stop(), 5000)
  } catch (e) {
    alert("Microphone access denied: " + e.message)
  }
  setRecording(false)
}
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body {
          background: #08080f;
          color: #e2e0ff;
          font-family: 'Inter', sans-serif;
          min-height: 100vh;
        }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: #2d1f5e; border-radius: 2px; }

        .input-field {
  width: 100%;
  padding: 12px 16px;
  background: #0e0e1a;
  border: 1.5px solid #ffffff;
  border-radius: 10px;
  color: #ffffff;
  font-family: 'Inter', sans-serif;
  font-size: 14px;
  outline: none;
  transition: border-color 0.2s, box-shadow 0.2s;
}
.input-field:focus {
  border-color: #ffffff;
  box-shadow: 0 0 0 3px rgba(255, 255, 255, 0.1);
}
.input-field::placeholder { color: #ffffff; }
.input-field:disabled { opacity: 0.4; cursor: not-allowed; }
        .input-field::placeholder { color: #3d2f6a; }
        .input-field:disabled { opacity: 0.4; cursor: not-allowed; }

        .btn-primary {
          padding: 12px 24px;
          background: linear-gradient(135deg, #7c3aed, #a855f7);
          color: #fff;
          border: none;
          border-radius: 10px;
          font-family: 'Inter', sans-serif;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s;
          white-space: nowrap;
        }
        .btn-primary:hover:not(:disabled) {
          background: linear-gradient(135deg, #6d28d9, #9333ea);
          transform: translateY(-1px);
          box-shadow: 0 4px 20px rgba(124, 58, 237, 0.4);
        }
          .btn-voice {
  padding: 12px;
  width: 44px;
  height: 44px;
  background: #0e0a1f;
  color: #a78bfa;
  border: 1px solid #2d1f5e;
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.btn-voice:hover:not(:disabled) {
  background: #1a0f3a;
  border-color: #7c3aed;
  box-shadow: 0 0 12px rgba(124, 58, 237, 0.3);
}
.btn-voice:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}
        .btn-primary:disabled {
          background: #1a1030;
          color: #3d2f6a;
          cursor: not-allowed;
          transform: none;
          box-shadow: none;
        }

        .card {
          background: #0c0c18;
          border: 1px solid #1e1535;
          border-radius: 16px;
          padding: 1.25rem;
        }

        .message-bubble {
          max-width: 78%;
          padding: 12px 16px;
          border-radius: 14px;
          font-size: 14px;
          line-height: 1.7;
        }

        .source-tag {
          font-size: 11px;
          padding: 3px 10px;
          border-radius: 20px;
          background: #1a0f3a;
          color: #a78bfa;
          border: 1px solid #2d1f5e;
          font-weight: 500;
        }

        .repo-badge {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          background: #0e0a1f;
          border: 1px solid #2d1f5e;
          padding: 5px 14px;
          border-radius: 20px;
          font-size: 12px;
          color: #a78bfa;
        }

        .purple-dot {
          width: 6px; height: 6px;
          border-radius: 50%;
          background: #a855f7;
          box-shadow: 0 0 6px #a855f7;
        }

        .dot {
          width: 6px; height: 6px;
          border-radius: 50%;
          background: #6d28d9;
          display: inline-block;
          animation: blink 1.4s infinite;
        }
        .dot:nth-child(2) { animation-delay: 0.2s; }
        .dot:nth-child(3) { animation-delay: 0.4s; }
        @keyframes blink { 0%,80%,100%{opacity:0.2} 40%{opacity:1} }

        .progress-bar {
          height: 3px;
          background: linear-gradient(90deg, #7c3aed, #a855f7, #7c3aed);
          background-size: 200% 100%;
          border-radius: 2px;
          animation: shimmer 1.5s infinite;
        }
        @keyframes shimmer {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }

        .ai-icon {
          width: 30px; height: 30px;
          background: #1a0f3a;
          border: 1px solid #2d1f5e;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .glow-text {
          background: linear-gradient(135deg, #a78bfa, #c4b5fd, #7c3aed);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .section-label {
          font-size: 11px;
          color: #3d2f6a;
          font-weight: 500;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          margin-bottom: 10px;
        }
      `}</style>

      <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>

        {/* Navbar */}
        <div style={{ padding: "14px 28px", borderBottom: "1px solid #12101f", display: "flex", alignItems: "center", justifyContent: "space-between", backdropFilter: "blur(10px)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 32, height: 32, background: "linear-gradient(135deg, #7c3aed, #a855f7)", borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round">
                <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"/>
              </svg>
            </div>
            <div>
              <span className="glow-text" style={{ fontWeight: 600, fontSize: 16 }}>Codebase Assistant</span>
              <span style={{ fontSize: 11, color: "#3d2f6a", marginLeft: 8 }}>powered by RAG</span>
            </div>
          </div>
          {indexed && (
            <div className="repo-badge">
              <div className="purple-dot"></div>
              {repoName}
            </div>
          )}
        </div>

        {/* Body */}
        <div style={{ flex: 1, maxWidth: 780, width: "100%", margin: "0 auto", padding: "2rem 1.5rem", display: "flex", flexDirection: "column", gap: 14 }}>

          {/* Repo card */}
          <div className="card">
            <p className="section-label">Repository</p>
            <div style={{ display: "flex", gap: 8 }}>
              <input
                className="input-field"
                type="text"
                value={repoUrl}
                onChange={e => setRepoUrl(e.target.value)}
                onKeyDown={e => e.key === "Enter" && indexRepo()}
                placeholder="https://github.com/owner/repo"
              />
              <button className="btn-primary" onClick={indexRepo} disabled={indexing || !repoUrl}>
                {indexing ? "Indexing..." : "Index"}
              </button>
            </div>
            {indexing && (
              <div style={{ marginTop: 12 }}>
                <div style={{ background: "#0e0a1f", borderRadius: 2, overflow: "hidden" }}>
                  <div className="progress-bar" style={{ width: "100%" }}></div>
                </div>
                <p style={{ fontSize: 12, color: "#4c3a8a", marginTop: 6 }}>Cloning, chunking and embedding...</p>
              </div>
            )}
            {indexed && !indexing && (
              <p style={{ marginTop: 10, fontSize: 12, color: "#a78bfa" }}>
                ✦ {chunks} chunks indexed and ready
              </p>
            )}
          </div>

          {/* Chat card */}
          <div className="card" style={{ flex: 1, display: "flex", flexDirection: "column", padding: 0, overflow: "hidden" }}>

            {/* Messages */}
            <div style={{ flex: 1, overflowY: "auto", padding: "1.25rem", display: "flex", flexDirection: "column", gap: 18, minHeight: 380, maxHeight: 500 }}>
              {messages.length === 0 && (
                <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 14, paddingTop: 60 }}>
                  <div style={{ width: 56, height: 56, background: "#0e0a1f", border: "1px solid #2d1f5e", borderRadius: 16, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#4c3a8a" strokeWidth="1.5" strokeLinecap="round">
                      <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
                    </svg>
                  </div>
                  <p style={{ fontSize: 14, color: "#3d2f6a" }}>Index a repository above to start asking questions</p>
                </div>
              )}

              {messages.map((msg, i) => (
                <div key={i} style={{ display: "flex", justifyContent: msg.role === "user" ? "flex-end" : "flex-start", gap: 10, alignItems: "flex-start" }}>
                  {msg.role === "assistant" && (
                    <div className="ai-icon">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#7c3aed" strokeWidth="2" strokeLinecap="round">
                        <circle cx="12" cy="12" r="3"/>
                        <path d="M12 2v3M12 19v3M4.22 4.22l2.12 2.12M17.66 17.66l2.12 2.12M2 12h3M19 12h3M4.22 19.78l2.12-2.12M17.66 6.34l2.12-2.12"/>
                      </svg>
                    </div>
                  )}
                  <div style={{ maxWidth: "78%" }}>
                    <div className="message-bubble" style={{
                      background: msg.role === "user"
                        ? "linear-gradient(135deg, #5b21b6, #7c3aed)"
                        : "#0e0a1f",
                      color: msg.role === "user" ? "#f5f3ff" : "#c4b5fd",
                      border: msg.role === "assistant" ? "1px solid #1e1535" : "none",
                      borderBottomRightRadius: msg.role === "user" ? 4 : 14,
                      borderBottomLeftRadius: msg.role === "assistant" ? 4 : 14,
                    }}>
                      {msg.text}
                    </div>
                    {msg.sources?.length > 0 && (
                      <div style={{ display: "flex", gap: 4, marginTop: 8, flexWrap: "wrap" }}>
                        {[...new Set(msg.sources)].map((src, j) => (
                          <span key={j} className="source-tag">{src.split("\\").pop()}</span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}

              {loading && (
                <div style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                  <div className="ai-icon">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#7c3aed" strokeWidth="2" strokeLinecap="round">
                      <circle cx="12" cy="12" r="3"/>
                      <path d="M12 2v3M12 19v3M4.22 4.22l2.12 2.12M17.66 17.66l2.12 2.12M2 12h3M19 12h3M4.22 19.78l2.12-2.12M17.66 6.34l2.12-2.12"/>
                    </svg>
                  </div>
                  <div className="message-bubble" style={{ background: "#0e0a1f", border: "1px solid #1e1535", display: "flex", gap: 5, alignItems: "center", padding: "14px 16px" }}>
                    <span className="dot"></span>
                    <span className="dot"></span>
                    <span className="dot"></span>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div style={{ borderTop: "1px solid #12101f", padding: "1rem 1.25rem", display: "flex", gap: 8 }}>
  <input
    className="input-field"
    type="text"
    value={question}
    onChange={e => setQuestion(e.target.value)}
    onKeyDown={handleKey}
    placeholder={indexed ? "Ask anything about this codebase..." : "Index a repo first..."}
    disabled={!indexed || loading}
  />
  <button
    className="btn-voice"
    onClick={startVoice}
    disabled={!indexed || recording}
    title="Ask with voice (5 seconds)"
  >
    {recording ? (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="#a855f7" stroke="#a855f7" strokeWidth="2">
        <circle cx="12" cy="12" r="8"/>
      </svg>
    ) : (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
        <rect x="9" y="2" width="6" height="12" rx="3"/>
        <path d="M5 10a7 7 0 0 0 14 0"/>
        <line x1="12" y1="19" x2="12" y2="22"/>
      </svg>
    )}
  </button>
  <button
    className="btn-primary"
    onClick={sendQuestion}
    disabled={!indexed || loading || !question.trim()}
  >
    Send
  </button>
</div>
          </div>
        </div>
      </div>
    </>
  )
}