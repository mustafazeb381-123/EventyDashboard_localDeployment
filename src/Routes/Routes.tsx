// routes.jsx
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import MainRoutes from "./MainRoutes";

import Home from "../pages/Home/Home";
import NotFound from "../pages/NotFound/NotFound";
import Login from "../pages/Login/Login";
import Signup from "../pages/Signup/Signup";
import path from "path";


const router = createBrowserRouter([
  {
    path: "/",
    element: <MainRoutes />, // this wraps with Header and Footer
    children: [
      {
        path: "home", // /home or /
        element: <Home />,
        },
        {
            path: "about", // /about
            element: <div>About Page</div>, // Placeholder for About component
            // Add more routes here that need header/footer
      },
    ],
  },
  {
    path: "/login",
    element: <Login />, // No header/footer
  },
  {
    path: "/signup",
    element: <Signup />, // No header/footer
  },
  {
    path: "*",
    element: <NotFound />, // Optional: you can choose to wrap or not
  },
]);

const Routes = () => {
  return <RouterProvider router={router} />;
};

export default Routes;
