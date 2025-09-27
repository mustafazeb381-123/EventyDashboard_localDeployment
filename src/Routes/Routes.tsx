import { createBrowserRouter, RouterProvider } from "react-router-dom";
import MainRoutes from "./MainRoutes";
import ProtectedRoute from "./ProtectedRoutes";

import Home from "../pages/Home/Home";
import NotFound from "../pages/NotFound/NotFound";
import Login from "../pages/Login/Login";
import Signup from "../pages/Signup/Signup";
import ExpressEvent from "@/pages/Home/ExpressEvent/ExpressEvent";

import RejectionTemplateTwo from "@/pages/Home/ExpressEvent/Confirmation/Templates/RejectionEmailTemplate/RejectionTemplateTwo";
import HomeSummary from "@/pages/Home/EventDetails/HomeSummary/HomeSummary";
import RegisterdUser from "@/pages/Home/EventDetails/RegisterdUser/RegisterdUser";
import Agenda from "@/pages/Home/EventDetails/Agenda/Agenda";
import Galleries from "@/pages/Home/EventDetails/Galleries/Galleries";
import PrintBadges from "@/pages/Home/EventDetails/PrintBadges/PrintBadges";
import Users from "@/pages/Home/EventDetails/Invitation/Users";

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
            path: "home/:id", // This path is now relative to "/" -> "/express-event"
            element: <HomeSummary />,
          },
          {
            path: "regesterd_user", // This path is now relative to "/" -> "/express-event"
            element: <RegisterdUser />,
          },
          {
            path: "agenda", // This path is now relative to "/" -> "/express-event"
            element: <Agenda />,
          },
          {
            path: "galleries", // This path is now relative to "/" -> "/express-event"
            element: <Galleries />,
          },
          {
            path: "print_badges", // This path is now relative to "/" -> "/express-event"
            element: <PrintBadges />,
          },
          {
            path: "invitation/user", // This path is now relative to "/" -> "/express-event"
            element: <Users />,
          },
          {
            path: "express-event/:id?", // This path is now relative to "/" -> "/express-event" with optional ID parameter
            element: <ExpressEvent />,
          },
          {
            path: "about", // This path is now relative to "/" -> "/about"
            element: <div>About Page</div>,
          },
          {
            path: "form",
            element: <RejectionTemplateTwo />,
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
  return <RouterProvider router={router} />;
};

export default Routes;
