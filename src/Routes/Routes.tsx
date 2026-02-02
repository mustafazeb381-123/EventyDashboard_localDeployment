import { createBrowserRouter, RouterProvider } from "react-router-dom";
import MainRoutes from "./MainRoutes";
import ProtectedRoute from "./ProtectedRoutes";

import Home from "../pages/Home/Home";
import NotFound from "../pages/NotFound/NotFound";
import ErrorPage from "../pages/ErrorPage/ErrorPage";
import Login from "../pages/Login/Login";
import Signup from "../pages/Signup/Signup";
import ExpressEvent from "@/pages/Home/ExpressEvent/ExpressEvent";

import RejectionTemplateTwo from "@/pages/Home/ExpressEvent/Confirmation/Templates/RejectionEmailTemplate/RejectionTemplateTwo";
import HomeSummary from "@/pages/Home/EventDetails/HomeSummary/HomeSummary";
import SummaryCardData from "@/pages/Home/EventDetails/SummaryCardData/SummaryCardData";
import RegisterdUser from "@/pages/Home/EventDetails/RegisterdUser/RegisterdUser";
import Agenda from "@/pages/Home/EventDetails/Agenda/Agenda";
import Galleries from "@/pages/Home/EventDetails/Galleries/Galleries";
import GalleriesList from "@/pages/Home/EventDetails/Galleries/GalleriesList";
import PrintBadges from "@/pages/Home/EventDetails/PrintBadges/PrintBadges";
import Users from "@/pages/Home/EventDetails/Invitation/Users";
import InvitationReport from "@/pages/Home/EventDetails/Invitation/InvitationReport";
import UserRegistration from "@/pages/Home/ExpressEvent/User Regsitration/UserRegistration";
import Poll from "@/pages/Home/EventDetails/Poll/Poll";
import PollDetails from "@/pages/Home/EventDetails/PollDetails/PollDetails";
import Qa from "@/pages/Home/EventDetails/QA/QA";
import TicketManagement from "@/pages/Home/EventDetails/TicketManagement/TicketManagement";
import Onboarding from "@/pages/Home/EventDetails/Onboarding/Onboarding";
import CheckIn from "@/pages/Home/EventDetails/Attendees/CheckIn";
import CheckOut from "@/pages/Home/EventDetails/Attendees/CheckOut";
import EmailTemplates from "@/pages/Home/EventDetails/EmailTemplates/EmailTemplates";

const router = createBrowserRouter([
  {
    path: "/", // The main path for all protected routes
    element: <ProtectedRoute />,
    errorElement: <ErrorPage />,
    children: [
      {
        element: <MainRoutes />, // MainRoutes now acts as a layout for children
        children: [
          {
            index: true, // This will render at the root path ("/")
            element: <Home />,
          },
          {
            path: "home/:id",
            element: <HomeSummary />,
          },
          {
            path: "home/:id/summary-card",
            element: <SummaryCardData />,
          },
          {
            path: "regesterd_user",
            element: <RegisterdUser />,
          },
          {
            path: "agenda",
            element: <Agenda />,
          },
          {
            path: "home/:id/galleries",
            element: <GalleriesList />,
          },
          {
            path: "home/:id/galleries/:galleryId",
            element: <Galleries />,
          },
          {
            path: "print_badges",
            element: <PrintBadges />,
          },
          {
            path: "user/registration",
            element: <UserRegistration />,
          },
          {
            path: "invitation",
            element: <Users />,
          },
          {
            path: "invitation/report/:invitationId",
            element: <InvitationReport />,
          },
          {
            path: "TicketManagement",
            element: <TicketManagement />,
          },
          {
            path: "Onboarding",
            element: <Onboarding />,
          },
          {
            path: "email-templates",
            element: <EmailTemplates />,
          },
          {
            path: "attendees",
            children: [
              {
                path: "check-in",
                element: <CheckIn />,
              },
              {
                path: "check-out",
                element: <CheckOut />,
              },
            ],
          },
          {
            path: "communication",
            children: [
              {
                path: "poll",
                element: <Poll />,
              },
              {
                path: "QA",
                element: <Qa />,
              },
              {
                path: "poll/:id",
                element: <PollDetails />,
              },
            ],
          },

          {
            path: "express-event/:id?",
            element: <ExpressEvent />,
          },
          {
            path: "about",
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
    path: "/register/:id",
    element: <UserRegistration />,
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
