import React, { useEffect, useState } from "react";

export default function Notifications() {
  const [messages, setMessages] = useState<string[]>([]);
  useEffect(() => {
    const socket = new window.WebSocket("ws://localhost:3000");
    socket.onmessage = (event) => {
      setMessages((msgs) => [...msgs, event.data]);
    };
    return () => socket.close();
  }, []);
  return (
    <div className="notifications">
      {messages.map((msg, i) => (
        <div key={i}>{msg}</div>
      ))}
    </div>
  );
}
