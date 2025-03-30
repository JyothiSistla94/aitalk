import React, { useState } from "react";
import ReactMarkdown from "react-markdown";
import "./App.css";

function App() {
  const [query, setQuery] = useState("");
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fileContent, setFileContent] = useState(null);
  const [isListening, setIsListening] = useState(false);

  const handleQueryChange = (e) => {
    setQuery(e.target.value);
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      setFileContent(event.target.result);
    };
    reader.readAsText(file);
  };

  const handleSubmit = async () => {
    if (!query.trim() && !fileContent) return;

    let queries = fileContent
      ? fileContent.split("\n").filter((line) => line.trim())
      : [query];

    setLoading(true);

    for (const q of queries) {
      try {
        const apiKey = "AIzaSyBXVCrE8WALXX1A2D4YLYCJvAQ_G1EaB8g";
        const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

        const payload = { contents: [{ parts: [{ text: q }] }] };

        const result = await fetch(url, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        const data = await result.json();
        const generatedText = data.candidates?.[0]?.content?.parts?.[0]?.text || "No response generated.";

        setMessages((prev) => [...prev, { query: q, response: generatedText }]);
      } catch (error) {
        console.error("Error:", error);
        setMessages((prev) => [...prev, { query: q, response: "An error occurred." }]);
      }
    }

    setQuery("");
    setFileContent(null);
    setLoading(false);
  };

  const startNewChat = () => {
    setMessages([]);
    setQuery("");
    setFileContent(null);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault(); 
      handleSubmit();
    }
  };

  const handleWebSearch = () => {
    if (!query.trim()) return;
    const searchUrl = `https://www.google.com/search?q=${encodeURIComponent(query)}`;
    window.open(searchUrl, "_blank");
  };

  const handleVoiceInput = () => {
    if (!("webkitSpeechRecognition" in window)) {
      alert("Your browser does not support speech recognition.");
      return;
    }

    const recognition = new window.webkitSpeechRecognition();
    recognition.lang = "en-US";
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => setIsListening(true);
    recognition.onresult = (event) => setQuery(event.results[0][0].transcript);
    recognition.onerror = () => setIsListening(false);
    recognition.onend = () => setIsListening(false);

    recognition.start();
  };

  return (
    <div className="app-container">
      <h1>How can I help you?</h1>

      <div className="messages-container">
        {messages.map((msg, index) => (
          <div key={index}>
            <div className="user-message-box">
              <p>{msg.query}</p>
            </div>
            <div className="ai-message-box">
              <ReactMarkdown>{msg.response}</ReactMarkdown>
            </div>
          </div>
        ))}
      </div>

      <div className="query-container">
        <textarea
          className="query-input"
          placeholder="Enter your query here..."
          value={query}
          onChange={handleQueryChange}
          onKeyDown={handleKeyDown}
          disabled={!!fileContent}
        ></textarea>

        <div className="buttons">
          <div className="file-upload-container">
            <input type="file" accept=".txt,.csv,.pdf" id="file-upload" onChange={handleFileUpload} style={{ display: "none" }} />
            <label htmlFor="file-upload" className="file-upload-button">
              <i className="bx bxs-plus-circle"></i>
            </label>
          </div>

          <button onClick={handleWebSearch}>
            <i className="bx bx-globe"></i> Search from web
          </button>
          <button onClick={handleVoiceInput}>
            <i className={`bx ${isListening ? "bxs-microphone-off" : "bxs-microphone"}`}></i>
          </button>
        </div>
      </div>

      <div className="button-container">
        <button onClick={handleSubmit} className="submit-button" disabled={loading}>
          {loading ? "Generating..." : "Generate"}
        </button>

        <button onClick={startNewChat} className="new_chat">
          <i className="bx bx-conversation"></i> Start New Chat
        </button>
      </div>
    </div>
  );
}

export default App;
