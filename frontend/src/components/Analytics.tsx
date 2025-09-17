import React from "react";

export default function Analytics() {
  React.useEffect(() => {
    const script = document.createElement("script");
    script.src = "/analytics.js";
    script.async = true;
    document.body.appendChild(script);
    return () => {
      document.body.removeChild(script);
    };
  }, []);
  return null;
}
