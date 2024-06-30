import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import HomePage from "./pages/HomePage";
import Signup from "./pages/Signup";
import Login from "./pages/Login";
import SessionContextProvider from "./context/SessionContext/SessionContextProvider";
import withSession from "./components/HOC/withSession";
import ForgotPassword from "./pages/ForgotPassword";
import EmailVerification from "./pages/EmailVerification";
import ResetPassword from "./pages/ResetPassword";
import CreateChannel from "./pages/CreateChannel";
import ChannelPage from "./pages/ChannelPage";
import SocketContextProvider from "./context/SocketContext/SocketContextProvider";
import DeleteProfile from "./pages/DeleteProfile";
import ChannelInfoPage from "./pages/ChannelInfoPage";

const HomePageWithSession = withSession(HomePage, "/login", true);
const CreateChannelWithSession = withSession(CreateChannel, "/login", true);
const ChannelPageWithSession = withSession(ChannelPage, "/login", true);
const ChannelInfoPageWithSession = withSession(ChannelInfoPage, "/login", true);
const DeleteProfileWithSession = withSession(DeleteProfile, "/login", true);

const SignupWithSession = withSession(Signup, "/", false);
const LoginWithSession = withSession(Login, "/", false);
const ForgotPasswordWithSession = withSession(ForgotPassword, "/", false);
const EmailVerificationWithSession = withSession(EmailVerification, "/", false);
const ResetPasswordWithSession = withSession(ResetPassword, "/", false);

const App: React.FC = () => {
  return (
    <SessionContextProvider>
      <SocketContextProvider>
        <Router>
          <Routes>
            <Route path="/" element={<HomePageWithSession />} />
            <Route
              path="/create-channel"
              element={<CreateChannelWithSession />}
            />
            <Route
              path="/channel/:channelId"
              element={<ChannelPageWithSession />}
            />
            <Route
              path="/channel/:channelId/info"
              element={<ChannelInfoPageWithSession />}
            />

            <Route
              path="/delete-profile"
              element={<DeleteProfileWithSession />}
            />

            <Route path="/signup" element={<SignupWithSession />} />
            <Route path="/login" element={<LoginWithSession />} />
            <Route
              path="/forgot-password"
              element={<ForgotPasswordWithSession />}
            />
            <Route
              path="/verify-email"
              element={<EmailVerificationWithSession />}
            />
            <Route
              path="/reset-password"
              element={<ResetPasswordWithSession />}
            />
          </Routes>
        </Router>
      </SocketContextProvider>
    </SessionContextProvider>
  );
};

export default App;
