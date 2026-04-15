import { createRoot } from "react-dom/client";
import App from "./App.jsx";
import "./index.css";

// حيدنا "!" اللي كانت مورا "root" حيت هاديك ديال TypeScript
const rootElement = document.getElementById("root");
const root = createRoot(rootElement);

root.render(<App />);