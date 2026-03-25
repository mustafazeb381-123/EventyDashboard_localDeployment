import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import "./styles/fonts.css"; // 👈 Import font definitions
import "react-toastify/dist/ReactToastify.css";

import { Provider } from "react-redux";
import { store } from "./store/store.ts";
import { AuthProvider } from "./context/AuthContext.tsx";
import { ThemeProvider } from "./context/ThemeContext.tsx";
import "../src/utils/i18n"; // Import i18n configuration
import "react-toastify/dist/ReactToastify.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <AuthProvider>
      <Provider store={store}>
        <ThemeProvider>
          <App />
        </ThemeProvider>
      </Provider>
    </AuthProvider>
  </StrictMode>
);
