import { useContext, useEffect, useRef, useState } from "react";
import "./Navbar.css";
import logoKKU from "../pic/logo-head.jpg";
import { Link, useNavigate } from "react-router-dom";
import { IoIosSearch } from "react-icons/io";
import { LuFileEdit } from "react-icons/lu";
import { UserContext } from "../App";
import { IoNotificationsOutline } from "react-icons/io5";
import UserNavigationPanel from "../components/user-navigation.component";
import axios from "axios";
import Notifications from "./chat/Notification";

function Navbar() {
  const [searchBoxVisibility, setSearchBoxVisibility] = useState(false);
  const [userNavPanel, setUserNavPanel] = useState(false);
  const [userNotiPanel, setUserNotiPanel] = useState(false);
  const [activeButton, setActiveButton] = useState("ทั้งหมด");
  const navigate = useNavigate();
  const {
    userAuth: { username },
    setUserAuth,
    NotificationShow,
  } = useContext(UserContext);
  const userId = sessionStorage.getItem("userId");

  const [notifications, setNotifications] = useState<any[]>([]);
  const API_BASE_URL = process.env.REACT_APP_API_ENDPOINT;

  const notiPanelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchNotifications = async () => {
      if (userId) {
        try {
          const response = await axios.get(
            `${API_BASE_URL}/notifications/${userId}`
          );

          if (response.status === 200) {
            let dataFilter = response.data.filter(
              (n: any) =>
                (n.user && n.user._id !== userId) || n.type == "delete"
            );
            // console.log("Debug", dataFilter);
            setNotifications(dataFilter);
          } else {
            console.error("Failed to fetch notifications:", response.data);
          }
        } catch (error) {
          console.error("Error fetching notifications:", error);
        }
      }
    };

    fetchNotifications();
    const intervalId = setInterval(fetchNotifications, 5000);
    return () => clearInterval(intervalId);
  }, [userId]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notiPanelRef.current && !notiPanelRef.current.contains(event.target as Node)) {
        setUserNotiPanel(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [notiPanelRef]);

  const handleNotificationClick = async (
    e: React.MouseEvent<HTMLDivElement>,
    type: string,
    notificationId: string,
    entityId: string,
    userId: string
  ) => {
    e.preventDefault();

    try {
      const response = await axios.patch(
        `${API_BASE_URL}/notifications/${notificationId}/mark-as-read`
      );

      if (response.status === 200) {
        setNotifications((prevNotifications) =>
          prevNotifications.map((notification) =>
            notification._id === notificationId
              ? { ...notification, seen: true }
              : notification
          )
        );
        navigate(
          type === "follow"
            ? `/user/${userId}`
            : type === "delete"
            ? `/`
            : `/blog/${entityId}`
        );
      } else {
        console.error("Failed to mark notification as read:", response.data);
      }
    } catch (error) {
      console.error("Failed to mark notification as read:", error);
    }
  };

  const {
    userAuth: { access_token, profile_picture },
  } = useContext(UserContext);

  const handleNavpanel = () => {
    setUserNavPanel((currentVal) => !currentVal);
  };

  const handleNotiPanel = () => {
    setUserNotiPanel((currentVal) => !currentVal);
  };

  const handleSearch = (e: React.KeyboardEvent<HTMLInputElement>) => {
    const query = e.currentTarget.value;

    if (e.key === "Enter" && query.length) {
      navigate(`/search/${query}`);
    }
  };

  const handleBlur = () => {
    setTimeout(() => {
      setUserNavPanel(false);
    }, 200);
  };

  console.log("notifications.length", notifications);

  const countUnseenNotifications = (notifications: any) => {
    if (!Array.isArray(notifications)) {
      throw new Error("Invalid data type: notifications should be an array.");
    }

    return notifications.reduce((count, notification) => {
      if (typeof notification.seen !== "boolean") {
        throw new Error(
          "Invalid data type: notification.seen should be a boolean."
        );
      }

      return notification.seen === false ? count + 1 : count;
    }, 0);
  };

  const handleNotiBlur = () => {
    setTimeout(() => {
      setUserNotiPanel(false);
    }, 200);
  };

  const formatTimeAgo = (timestamp: string) => {
    const now = new Date();
    const createdAt = new Date(timestamp);
    const diffInSeconds = Math.floor(
      (now.getTime() - createdAt.getTime()) / 1000
    );

    if (diffInSeconds < 60) {
      return `ไม่กี่วินาทีที่แล้ว`;
    }

    const diffInMinutes = Math.floor(diffInSeconds / 60);
    if (diffInMinutes < 60) {
      return `${diffInMinutes} นาทีที่แล้ว`;
    }

    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) {
      return `${diffInHours} ชั่วโมงที่แล้ว`;
    }

    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays <= 3) {
      return `${diffInDays} วันที่แล้ว`;
    }

    return createdAt.toLocaleDateString("th-TH", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const filteredNotifications = notifications.filter((notification) => {
    if (activeButton === "ทั้งหมด") return true;
    if (activeButton === "อ่านแล้ว") return notification.seen;
    if (activeButton === "ยังไม่อ่าน") return !notification.seen;
    return true;
  });

  return (
    <nav className="navbar-navbar">
      <Link to="/" className="logo-link">
        <img src={logoKKU} alt="Logo" className="logo-img" />
      </Link>

      <div
        className={`search-container ${searchBoxVisibility ? "show" : "hide"} `}
      >
        <input
          type="text"
          placeholder="Search..."
          className="search-input"
          onKeyDown={handleSearch}
        />
        <IoIosSearch className="icon-search" />
      </div>

      <div className="toggle-search">
        <div className="toggle-search-2">
          <button
            onClick={() => setSearchBoxVisibility((currentval) => !currentval)}
            className="search-toggle"
          >
            <IoIosSearch className="toggle-icon" />
          </button>
        </div>
        {access_token ? (
          <>
            <Link
              to="/editor"
              className="d-none d-md-flex align-items-center gap-2 md:flex gap-2 link"
              style={{ textDecoration: "none" }}
            >
              <LuFileEdit />
              <p className="m-0">เขียน</p>
            </Link>

            <Notifications />

            {/* <Link to="/dashboard/notification"> */}
            <div
              className="relative"
              style={{ position: "relative" }}
              ref={notiPanelRef}
            >
              <button onClick={handleNotiPanel} className="button-noti">
                <IoNotificationsOutline
                  className="d-block"
                  style={{ fontSize: "1.5rem" }}
                />
                {countUnseenNotifications(notifications) > 0 && (
                  <p
                    style={{
                      backgroundColor: "red",
                      borderRadius: "50px",
                      width: "1.2rem",
                      height: "1.2rem",
                      color: "white",
                      marginTop: "-1rem",
                      marginRight: "-1rem",
                      fontSize: "0.8rem",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      opacity: NotificationShow ? 1 : 0,
                    }}
                  >
                    {countUnseenNotifications(notifications)}
                  </p>
                )}
              </button>

              {userNotiPanel ? (
                <div
                  className="notifications-container"
                  style={{
                    maxHeight: notifications.length > 5 ? "400px" : "auto", // ถ้าเกิน 5 รายการ ให้แสดง Scroll Bar
                    overflowY: notifications.length > 5 ? "auto" : "visible",
                    scrollbarWidth: "thin", // Firefox
                    scrollbarColor: "#B0B0B0 transparent",
                  }}
                >
                  <h4 style={{ margin: "3%" }}>การแจ้งเตือน</h4>
                  <div className="notifications-categories">
                    <button
                      className={activeButton === "ทั้งหมด" ? "active" : ""}
                      onClick={() => setActiveButton("ทั้งหมด")}
                    >
                      ทั้งหมด
                    </button>
                    <button
                      className={activeButton === "อ่านแล้ว" ? "active" : ""}
                      onClick={() => setActiveButton("อ่านแล้ว")}
                    >
                      อ่านแล้ว
                    </button>
                    <button
                      className={activeButton === "ยังไม่อ่าน" ? "active" : ""}
                      onClick={() => setActiveButton("ยังไม่อ่าน")}
                    >
                      ยังไม่อ่าน
                    </button>
                  </div>
                  <hr style={{ opacity: 0.1, marginTop: "0.3rem" }} />
                  {filteredNotifications.length === 0 ? (
                    <p style={{ textAlign: "center", padding: "10px" }}>
                      ไม่มีการแจ้งเตือน
                    </p>
                  ) : (
                    [...filteredNotifications]
                      .sort(
                        (a, b) =>
                          new Date(b.createdAt).getTime() -
                          new Date(a.createdAt).getTime()
                      ) // เรียงจากล่าสุด -> เก่าสุด
                      .map((notification, idx) => (
                        <div
                          key={idx}
                          className={`notification-item ${
                            !notification.seen ? "unread" : ""
                          }`}
                          onClick={(e) => {
                            const entityId =
                              notification.blog?.blog_id || notification._id;
                            handleNotificationClick(
                              e,
                              notification.type,
                              notification._id,
                              entityId,
                              notification.user ? notification.user._id : null
                            );
                            handleNotiPanel();
                          }}
                        >
                          <img
                            src={
                              notification.type !== "delete"
                                ? notification.user.profile_picture
                                : "https://www.svgrepo.com/show/116240/wrench-and-hammer-tools-thin-outline-symbol-inside-a-circle.svg"
                            }
                            alt={
                              notification.type !== "delete" ? "User" : "Admin"
                            }
                          />
                          <div className="notification-text">
                            <p>
                              {notification.type === "delete"
                                ? `บล็อกของคุณถูกลบเนื่องจาก ${notification.reason}`
                                : notification.type === "follow"
                                ? `${notification.user.fullname} เริ่มติดตามคุณ`
                                : notification.type === "like"
                                ? `${notification.user.fullname} กดถูกใจบล็อกของคุณ`
                                : notification.type === "comment"
                                ? `${notification.user.fullname} แสดงความคิดเห็นบนบล็อกของคุณ`
                                : notification.type === "reply"
                                ? `${notification.user.fullname} ตอบกลับความคิดเห็นของคุณ`
                                : `${notification.user.fullname} commented on your blog`}
                            </p>
                            <small style={{ marginTop: "2px" }}>
                              {formatTimeAgo(notification.createdAt)}
                            </small>
                          </div>
                        </div>
                      ))
                  )}
                </div>
              ) : (
                ""
              )}
            </div>

            <div
              className="relative"
              style={{ position: "relative" }}
              onClick={handleNavpanel}
              onBlur={handleBlur}
            >
              <button
                className=" mt-1"
                style={{ width: "3rem", height: "3rem" }}
              >
                <img
                  src={profile_picture}
                  className="img-fluid rounded-circle"
                  alt=""
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                />
              </button>

              {userNavPanel ? <UserNavigationPanel /> : ""}
            </div>
          </>
        ) : (
          <>
            <Link
              className="btn-dark py-2"
              to="/signin"
              style={{ textDecoration: "none" }}
            >
              เข้าสู่ระบบ
            </Link>

            <Link
              className="btn-light py-2 hidden md:block"
              to="/signup"
              style={{ textDecoration: "none" }}
            >
              สมัครสมาชิก
            </Link>
          </>
        )}
      </div>
    </nav>
  );
}

export default Navbar;