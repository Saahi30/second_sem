import React, { useState } from 'react';

const SPACE_IMAGE_URL = "https://www.rawpixel.com/image/7514064/photo-image-public-domain-galaxy-space"; // Public domain space image

const LOREM = `Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed euismod, nunc ut laoreet dictum, massa erat cursus enim, nec dictum ex enim nec urna. Etiam euismod, nunc ut laoreet dictum, massa erat cursus enim, nec dictum ex enim nec urna.`;

const GEMINI_API_KEY = "AIzaSyB42vuVtTTkggBWy354DmqZjEA3EoxM-G0";
const GEMINI_MODEL = "gemini-2.0-flash-lite";

const ContextRichDialog: React.FC = () => {
  const [messages, setMessages] = useState<{role: string, content: string}[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const sendMessage = async () => {
    if (!input.trim()) return;
    const userMessage = { role: "user", content: input };
    setMessages([...messages, userMessage]);
    setInput("");
    setLoading(true);
    try {
      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [
              ...messages.map(m => ({ role: m.role, parts: [{ text: m.content }] })),
              { role: "user", parts: [{ text: input }] }
            ]
          })
        }
      );
      const data = await res.json();
      const aiContent = data?.candidates?.[0]?.content?.parts?.[0]?.text || "(No response)";
      setMessages([...messages, userMessage, { role: "model", content: aiContent }]);
    } catch (e) {
      setMessages([...messages, userMessage, { role: "model", content: "Error contacting Gemini API." }]);
    }
    setLoading(false);
  };

  return (
    <div style={{
      width: '700px',
      height: '350px',
      background: '#fff',
      borderRadius: '24px',
      boxShadow: '0 4px 32px rgba(0,0,0,0.12)',
      display: 'flex',
      overflow: 'hidden',
      fontFamily: 'sans-serif',
    }}>
      {/* Left half */}
      <div style={{ flex: 1, padding: '32px', borderRight: '2px solid #eee', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ fontSize: '1.1rem', color: '#222' }}>{LOREM}</div>
      </div>
      {/* Right half split */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        {/* Upper half: image */}
        <div style={{ flex: 1, borderBottom: '2px solid #eee', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f7f7fa' }}>
          <img src={SPACE_IMAGE_URL} alt="Space" style={{ maxWidth: '90%', maxHeight: '90%', borderRadius: '12px' }} />
        </div>
        {/* Lower half: chat */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: '12px', background: '#f9f9fb' }}>
          <div style={{ flex: 1, overflowY: 'auto', marginBottom: '8px', fontSize: '0.98rem' }}>
            {messages.map((m, i) => (
              <div key={i} style={{ margin: '4px 0', textAlign: m.role === 'user' ? 'right' : 'left' }}>
                <span style={{
                  display: 'inline-block',
                  background: m.role === 'user' ? '#dbeafe' : '#e0e7ef',
                  color: '#222',
                  borderRadius: '8px',
                  padding: '6px 12px',
                  maxWidth: '80%',
                  wordBreak: 'break-word',
                }}>{m.content}</span>
              </div>
            ))}
            {loading && <div style={{ color: '#888', fontStyle: 'italic' }}>Gemini is typing...</div>}
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <input
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') sendMessage(); }}
              placeholder="Ask Gemini..."
              style={{ flex: 1, borderRadius: '6px', border: '1px solid #ccc', padding: '8px' }}
              disabled={loading}
            />
            <button
              onClick={sendMessage}
              disabled={loading || !input.trim()}
              style={{ padding: '8px 16px', borderRadius: '6px', border: 'none', background: '#2563eb', color: '#fff', fontWeight: 600, cursor: loading ? 'not-allowed' : 'pointer' }}
            >
              Send
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContextRichDialog; 