import "./App.css";
import Routes from "./Routes/Routes";
import { ToastContainer } from "react-toastify";
import { useTranslation } from "react-i18next";
import { useTheme } from "./context/ThemeContext";

function App() {
  const { i18n } = useTranslation();
  const { theme } = useTheme();

  return (
    <>
      <Routes />
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={i18n.dir() === "rtl"}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme={theme}
      />
    </>
  );
}

export default App;
