import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import "./styles/fonts.css"; // 👈 Import font definitions

import { Provider } from "react-redux";
import { store } from "./store/store.ts";
import { AuthProvider } from "./context/AuthContext.tsx";
import "../src/utils/i18n"; // Import i18n configuration
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <AuthProvider>
      <Provider store={store}>
        <App />
        <ToastContainer
          position="top-right"
          autoClose={3000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
        />
      </Provider>
    </AuthProvider>
  </StrictMode>
);
