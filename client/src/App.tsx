import React, { useEffect, useState, ReactNode } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Outlet,
  Navigate,
} from "react-router-dom";
import LoginPage from "./Screens/login";
import HomePage from "./Screens/home.page";
import FirstPage from "./Screens/firstpage";
import EditProfile from "./Screens/edit-profile.page";
import RegisterAdmin from "./Screens/Admin/adminRegister";
import AdminHome from "./Screens/Admin/adminHome";
import Footer from "./Navbar/footer";
import ForgotPassword from "./Screens/Admin/ForgotPassword";
import ResetPassword from "./Screens/Admin/ResetPassword";
import ResetPasswordUser from "./Screens/ResetPasswordUser";
import Chat from "./Screens/chat";
import { ChatContextProvider } from "./Screens/ChatContext";
import Navbar2 from "./Navbar/Navbar1";
import Navbar from "./Navbar/Navbar";
import HelpCentre from "./Screens/helpcentre";
import Helpnotlog from "./Screens/help-notlogin";
import { createContext } from "react";
import { lookInSession } from "./common/session";
import UserAuthForm from "./Screens/UserAuthForm";
import Editor from "./Screens/editor-page";
import SearchPage from "./Screens/search.page";
import PageNotFound from "./Screens/404";
import ProfilePage from "./Screens/ProfilePage";
import BlogPage from "./Screens/blog.page";
import DashboardUser from "./Screens/DashboardUser";
import LoginAdmin from "./Screens/Admin/adminLogin";
import ProfileAdmin from "./Screens/Admin/adminProfile";
import SideNav from "./components/sideNavbar";
import ChangPassword from "./Screens/change-password";
import Notifications from "./Screens/notifications.page";
import ManageBlogs from "./Screens/manageblogs";
import ReportCheck from "./Screens/reportCheck";
import NotiSetting from "./Screens/noti-setting";
import ForgotPasswordUser from "./Screens/ForgotPasswordUser";
import axios from "axios";
import { API_BASE_URL } from "./api/post";
import PostStatisticsChart from "./components/stat-component";

interface UserContextType {
  userAuth: {
    access_token: string | null;
    _id?: string;
    username?: string;
    fullname?: string;
    profile_picture?: string;
    new_notification_available?: boolean;
  };
  setUserAuth: React.Dispatch<React.SetStateAction<any>>;
  NotificationShow: boolean;
  setNotificationShow: React.Dispatch<React.SetStateAction<boolean>>;
}

interface User {
  access_token?: string;
  role?: string;
  username?: string;
  _id?: string;
}

export const UserContext = createContext<UserContextType>({
  userAuth: { access_token: null },
  setUserAuth: () => {},
  NotificationShow: true,
  setNotificationShow: () => {},
});

function NavbarLayout() {
  return (
    <>
      <Navbar />
      <Outlet />
    </>
  );
}

function App() {
  const [userAuth, setUserAuth] = useState<{ access_token: string | null }>({
    access_token: null,
  });
  const [NotificationShow, setNotificationShow] = useState(false);

  useEffect(() => {
    const userInSession = lookInSession("user");
    userInSession
      ? setUserAuth(JSON.parse(userInSession))
      : setUserAuth({ access_token: null });
  }, []);

  useEffect(() => {
    const fetchNotificationStatus = async () => {
      try {
        const storedUser = sessionStorage.getItem("user");
        if (!storedUser) {
          console.error("No user data found in sessionStorage");
          return;
        }

        const { access_token } = JSON.parse(storedUser);
        if (!access_token) {
          console.error("No access token found");
          return;
        }

        const { data } = await axios.post(
          `${API_BASE_URL}/profile/notification-status`,
          {},
          {
            headers: { Authorization: `Bearer ${access_token}` },
          }
        );

        if (data.success) {
          setNotificationShow(data.notification_enable);
        } else {
          console.error("Failed to fetch notification settings");
        }
      } catch (error) {
        console.error("Error fetching notification status:", error);
      }
    };

    fetchNotificationStatus();
  }, [setNotificationShow]);

  function PrivateRoute({ children }: { children: ReactNode }) {
    const user = JSON.parse(
      sessionStorage.getItem("user") || "{}"
    ) as User | null;

    if (!user?.access_token) {
      return <Navigate to="/admin/login" />;
    }
    return <>{children}</>;
  }

  return (
    <UserContext.Provider
      value={{ userAuth, setUserAuth, NotificationShow, setNotificationShow }}
    >
      <ChatContextProvider>
        <Routes>
          <Route path="/editor" element={<Editor />} />
          <Route path="/editor/:blog_id" element={<Editor />} />
          <Route element={<NavbarLayout />}>
            <Route
              path="/signin"
              element={<UserAuthForm type="เข้าสู่ระบบ" />}
            />
            <Route
              path="/signup"
              element={<UserAuthForm type="สมัครสมาชิก" />}
            />
            <Route path="/homepage" element={<HomePage />} /> {/* Updated route */}
            <Route path="/user/:id" element={<ProfilePage />} />
            <Route path="/search/:query" element={<SearchPage />} />
            <Route path="*" element={<PageNotFound />} />
            <Route path="/blog/:blog_id" element={<BlogPage />}></Route>
            <Route path="/profile/edit-profile/:id" element={<EditProfile />} />
            <Route path="settings" element={<SideNav />}>
              <Route path="edit-profile" element={<EditProfile />}></Route>
              <Route path="change-password" element={<ChangPassword />}></Route>
              <Route path="noti-setting" element={<NotiSetting />} />
            </Route>
            <Route path="/footer" element={<Footer />} />
            <Route
              path="/stat"
              element={<PostStatisticsChart postId="67d9279351d2ec5af3522fb7" />}
            />

            <Route path="dashboard" element={<SideNav />}>
              <Route path="blogs" element={<ManageBlogs />} />
              <Route path="notifications" element={<Notifications />} />
              <Route path="reportCheck" element={<ReportCheck />} />
            </Route>

            <Route
              path="/dashboard/blogs/statistics"
              element={<DashboardUser />}
            />
            <Route path="/helpcentre" element={<HelpCentre />} />
            <Route path="/help-notlogin" element={<Helpnotlog />} />
          </Route>
          <Route path="/" element={<FirstPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/admin/register" element={<RegisterAdmin />} />
          <Route path="/admin/login" element={<LoginAdmin type="admin" />} />
          <Route path="/admin/" element={<RegisterAdmin />} />

          <Route
            path="/admin/:adminId/profile"
            element={
              <PrivateRoute>
                <ProfileAdmin />
              </PrivateRoute>
            }
          />
          <Route
            path="/admin/:adminId"
            element={
              <PrivateRoute>
                <AdminHome />
              </PrivateRoute>
            }
          />

          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route
            path="/forgot-password-user"
            element={<ForgotPasswordUser />}
          />
          <Route path="/reset-password/:token" element={<ResetPassword />} />
          <Route
            path="/reset-password-user/:token"
            element={<ResetPasswordUser />}
          />
          <Route path="/chats" element={<Chat />} />
          <Route path="/nav" element={<Navbar2 />} />
        </Routes>
      </ChatContextProvider>
    </UserContext.Provider>
  );
}

export default App;
