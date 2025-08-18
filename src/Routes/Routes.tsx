import { createBrowserRouter, RouterProvider } from "react-router-dom";
import MainRoutes from "./MainRoutes";
import ProtectedRoute from "./ProtectedRoutes";

import Home from "../pages/Home/Home";
import NotFound from "../pages/NotFound/NotFound";
import Login from "../pages/Login/Login";
import Signup from "../pages/Signup/Signup";
import ExpressEvent from "@/pages/Home/ExpressEvent/ExpressEvent";

import TemplateForm from "@/pages/Home/ExpressEvent/RegistrationForm/RegistrationTemplates/TemplateTwo/TemplateForm";

const router = createBrowserRouter([
  {
    path: "/", // The main path for all protected routes
    element: <ProtectedRoute />,
    children: [
      {
        element: <MainRoutes />, // MainRoutes now acts as a layout for children
        children: [
          {
            index: true, // This will render at the root path ("/")
            element: <Home />,
          },
          {
            path: "express-event", // This path is now relative to "/" -> "/express-event"
            element: <ExpressEvent />
          },
          {
            path: "about", // This path is now relative to "/" -> "/about"
            element: <div>About Page</div>,
          },
          {
            path: "form",
            element: <TemplateForm />
          }
        ],
      },
    ],
  },
  {
    path: "/login",
    element: <Login />,
  },
  {
    path: "/signup",
    element: <Signup />,
  },
  {
    path: "*",
    element: <NotFound />,
  },
]);


const Routes = () => {
  return <RouterProvider router={router} />
}

export default Routes;
