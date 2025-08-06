import { createBrowserRouter, RouterProvider } from "react-router-dom";
import MainRoutes from "./MainRoutes";
import ProtectedRoute from "./ProtectedRoutes";

import Home from "../pages/Home/Home";
import NotFound from "../pages/NotFound/NotFound";
import Login from "../pages/Login/Login";
import Signup from "../pages/Signup/Signup";
import ExpressEvent from "@/pages/Home/ExpressEvent/ExpressEvent";

const router = createBrowserRouter([
  {
    element: <ProtectedRoute />, // checks for token
    children: [
      {
        path: "/",
        element: <MainRoutes />, // contains Header/Footer
        children: [
          {
            path: "/home",
            children: [
              {
                index: true,
                element: <Home />,
            },
              {
                path: "express-event",
                element: <ExpressEvent />
              }
            ]
          },
          {
            path: "about",
            element: <div>About Page</div>,
          },
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
