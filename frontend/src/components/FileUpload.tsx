import React, { useRef } from "react";

export default function FileUpload({
  onUpload,
}: {
  onUpload: (file: File) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  return (
    <div>
      <input
        type="file"
        ref={inputRef}
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) onUpload(file);
        }}
      />
    </div>
  );
}
