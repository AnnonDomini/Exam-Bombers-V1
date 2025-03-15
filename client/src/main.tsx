import { createRoot } from "react-dom/client";
import App from "./App";
import { ThemeProvider } from "./components/theme-provider"; // Added import for ThemeProvider
import "./index.css";

createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <ThemeProvider defaultTheme="system"> {/* Wrapped App with ThemeProvider */}
      <App />
    </ThemeProvider>
  </React.StrictMode>
);