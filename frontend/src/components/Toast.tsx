import React, { useState } from "react";

export default function Toast({ message }: { message: string }) {
  const [visible, setVisible] = useState(true);
  if (!visible) return null;
  return (
    <div className="toast">
      {message}
      <button onClick={() => setVisible(false)}>Close</button>
    </div>
  );
}
