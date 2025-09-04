import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import "./styles/fonts.css"; // 👈 Import font definitions

import { Provider } from "react-redux";
import { store } from "./RTK/store/store.ts";
import { AuthProvider } from "./context/AuthContext.tsx";
import "../src/utils/i18n"; // Import i18n configuration

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <AuthProvider>
      <Provider store={store}>
        <App />
      </Provider>
    </AuthProvider>
  </StrictMode>
);
