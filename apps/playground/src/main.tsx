import React from "react";
import ReactDOM from "react-dom/client";

import PlaygroundApp from "./PlaygroundApp";
import "./styles.css";

ReactDOM.createRoot(
  document.getElementById("root")!
).render(
  <React.StrictMode>
    <PlaygroundApp />
  </React.StrictMode>
);
