import React, { useState, useEffect, useRef, useCallback, ReactNode, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../Navbar/navbar1.css";
import logoKKU from "../pic/logo-head.jpg";
import { IoIosSearch } from "react-icons/io";
import { PiUserCircleFill } from "react-icons/pi";
import { RxHamburgerMenu } from "react-icons/rx";
import { FaUserAlt } from "react-icons/fa";
import { FaPenToSquare } from "react-icons/fa6";
import { IoMdSettings, IoIosStats, IoIosHelpCircleOutline } from "react-icons/io";
import { FaRegPenToSquare } from "react-icons/fa6";
import { IoLogOutOutline, IoNotificationsOutline } from "react-icons/io5";
import { getPosts } from "../api/post";
import { Post } from "../types/post";
import Notifications from "./chat/Notification";
import { searchPost } from "../api/search";
import { Dropdown } from "react-bootstrap";
import { FaUser } from "react-icons/fa";
import axios from "axios";

const cates = ["Piyarat U", "ท่องเที่ยว", "Pearr"].map((name, index) => ({
  name,
  id: index
}));

interface Navbar1Props {
  children?: ReactNode;
}

const Navbar1: React.FC<Navbar1Props> = ({ children }) => {
  const [showDropdown, setShowDropdown] = useState(false);
  const [search, setSearch] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const [feeds, setFeeds] = useState<Post[] | null>(null);
  const [userId, setUserId] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [isNotiOpen, setIsNotiOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await getPosts();
        setFeeds(res);
      } catch (e) {
        console.error(e);
      }
    }
    fetchData();
  }, []);

  useEffect(() => {
    const header = document.querySelector(".headerr");
    const menu = document.querySelector("#menu-icon");
    const navmenu = document.querySelector(".navmenu");

    const handleScroll = () => {
      header?.classList.toggle("sticky", window.scrollY > 0);
    };

    const handleMenuClick = () => {
      menu?.classList.toggle("bx-x");
      navmenu?.classList.toggle("open");
    };

    window.addEventListener("scroll", handleScroll);
    menu?.addEventListener("click", handleMenuClick);

    const storedUserId = localStorage.getItem("userId");
    if (storedUserId) {
      setUserId(storedUserId);
    }

    return () => {
      window.removeEventListener("scroll", handleScroll);
      menu?.removeEventListener("click", handleMenuClick);
    };
  }, []);

  const toggleDropdown = () => {
    setShowDropdown(!showDropdown);
  };

  const handleClick = () => {
    if (!showDropdown) {
      inputRef.current?.focus();
    }
    setShowDropdown(!showDropdown);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
  };

  const filteredCate = cates.filter(
    (cate) => search.length && cate.name.toLowerCase().includes(search.toLowerCase())
  );

  // const handleKeyPress = async (
  //   event: React.KeyboardEvent<HTMLInputElement>
  // ) => {
  //   if (event.key === "Enter") {
  //     const query = (event.target as HTMLInputElement).value.trim();

  //     if (!query) {
  //       console.error("Invalid query:", query);
  //       return;
  //     }

  //     setLoading(true);

  //     try {
  //       const encodedQuery = encodeURIComponent(query);
  //       const endpoint =
  //         searchType === "users"
  //           ? `https://kku-for-deploy.onrender.com/users/search?query=${encodedQuery}`
  //           : `https://kku-for-deploy.onrender.com/posts/search?query=${encodedQuery}`;

  //       const response = await fetch(endpoint, {
  //         method: "GET",
  //         headers: {
  //           "Content-Type": "application/json",
  //         },
  //       });

  //       if (!response.ok) {
  //         const statusText = response.statusText || "Unknown Error";
  //         throw new Error(`Server returned ${response.status} ${statusText}`);
  //       }

  //       const data = await response.json();
  //       console.log("Search results:", data);

  //       // ส่งข้อมูลไปยังหน้าใหม่
  //       navigate("/search", { state: { searchResult: data, searchType } });
  //     } catch (error) {
  //       console.error("Error fetching data:", error);
  //     } finally {
  //       setLoading(false);
  //     }
  //   }
  // };
  const handleClickPost = () => {
    navigate(`/posts`);
  };

  const [showReportModal, setShowReportModal] = useState(false);
  const [reportPostId, setReportPostId] = useState<string | null>(null);
  const [reportReason, setReportReason] = useState("");

  const handleShowReportModal = (id: string) => {
    setReportPostId(id);
    setShowReportModal(true);
  };

  const handleCloseReportModal = () => {
    setShowReportModal(false);
    setReportPostId(null);
    setReportReason("");
  };

  const handleKeyPress = async (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      const query = (event.target as HTMLInputElement).value.trim();

      if (!query) {
        console.error("คำค้นหาห้ามเป็นค่าว่าง");
        return; // ไม่ดำเนินการเรียก API หากคำค้นหาว่าง
      }

      setLoading(true);

      try {
        const posts = await searchPost(query);

        console.log("ผลลัพธ์การค้นหา:", posts);

        // นำทางไปยังหน้าแสดงผลการค้นหา
        navigate("/search", {
          state: { searchQuery: query }
        });
      } catch (error) {
        console.error("ข้อผิดพลาดในการดึงโพสต์:", error);
      } finally {
        setLoading(false);
      }
    }
  };

  const handleClickselectPost = () => {
    setDropdownOpen(!dropdownOpen); // Toggle Dropdown visibility
  };

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const handleLogout = useCallback(() => {
    localStorage.removeItem("userId");
    setUserId("");
    navigate("/login");
  }, [navigate]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (inputRef.current && !inputRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleNotificationClick = async (
    e: React.MouseEvent<HTMLAnchorElement>,
    type: string,
    notificationId: string,
    entityId: string
  ) => {
    e.preventDefault();
    try {
      await axios.patch(`${process.env.REACT_APP_API_ENDPOINT}/notifications/${notificationId}/mark-as-read`);
      setNotifications((prevNotifications) =>
        prevNotifications.map((notification) =>
          notification._id === notificationId ? { ...notification, isRead: true } : notification
        )
      );
      navigate(type === "follow" ? `/profile/${entityId}` : `/content/${entityId}`);
    } catch (error) {
      console.error("Failed to mark notification as read:", error);
    }
  };

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const response = await axios.get(`${process.env.REACT_APP_API_ENDPOINT}/notifications?userId=${userId}`);
        setNotifications(response.data);
      } catch (error) {
        console.error("Error fetching notifications:", error);
      }
    };

    fetchNotifications();

    const intervalId = setInterval(fetchNotifications, 5000);
    return () => clearInterval(intervalId);
  }, [userId]);

  const toggleNotiMenu = () => {
    setIsNotiOpen(!isNotiOpen);
  };

  const NotificationIcon = () => {
    const unreadCount = useMemo(
      () => notifications.filter((notification) => !notification.isRead).length,
      [notifications]
    );

    return (
      <div style={{ position: "relative", display: "inline-block" }} onClick={toggleNotiMenu}>
        <IoNotificationsOutline size={24} />
        {unreadCount > 0 && <span className="notification-badge">{unreadCount}</span>}
        <Dropdown show={isNotiOpen} onToggle={() => setIsNotiOpen(!isNotiOpen)}>
          <Dropdown.Menu
            style={{
              right: "-40px",
              top: "8px",
              maxHeight: "300px",
              overflowY: "auto"
            }}
          >
            <h4 style={{ margin: "20px" }}>Notifications</h4>
            {notifications.slice(0, 7).map((notification) => {
              return (
                <Dropdown.Item key={notification._id} href="#">
                  <div
                    className="d-flex"
                    style={
                      notification.isRead
                        ? { backgroundColor: "transparent" }
                        : {
                            backgroundColor: "#e4dce7",
                            borderRadius: "10px",
                            padding: "5px"
                          }
                    }
                  >
                    <p
                      className="m-0"
                      onClick={(e: any) =>
                        handleNotificationClick(
                          e,
                          notification.type,
                          notification._id,
                          notification.entity
                        )
                      }
                    >
                      {notification.message}
                    </p>
                  </div>
                </Dropdown.Item>
              );
            })}
          </Dropdown.Menu>
        </Dropdown>
      </div>
    );
  };

  return (
    <div className="navbarreal">
      <div className="headerr d-flex">
        <a href="#" className="logo1">
          <img src={logoKKU} alt="logo" />
        </a>

        <ul className="navmenu">
          <li>
            <a href="/">หน้าแรก</a>
          </li>
          <li>
            <a href="category">หมวดหมู่</a>
          </li>
          <li>
            <a href="#">เกี่ยวกับเรา</a>
          </li>
        </ul>

        <div className="nav-icon">
          <div className={`search ${showDropdown ? "open" : ""}`}>
            <input
              ref={inputRef}
              onChange={handleChange}
              onKeyDown={handleKeyPress}
              placeholder="Search..."
              type="text"
            />
            <IoIosSearch
              onClick={handleClick}
              className={`uil uil-${showDropdown ? "multiply" : "search"}`}
            />
          </div>

          <a href="#/action-1" onClick={handleClickPost}>
            <FaPenToSquare className="icon-style" color="#22222" style={{ fontSize: "20px" }} />
          </a>

          <NotificationIcon />
          <div className={`items ${showDropdown ? "open" : ""}`}>
            {filteredCate.length > 0 &&
              filteredCate.map((cate) => (
                <button key={cate.id} style={{ color: "#222222" }}>
                  {cate.name}
                </button>
              ))}
          </div>

          <Notifications />

          <div className="user-profile-dropdown">
            <PiUserCircleFill onClick={handleClickselectPost} />
            {/* {isOpen && (
              <div className="dropdown-item1">
                <ul>
                  <li>
                    <FaUserAlt />
                    <Link to={`/profile/${userId}`}>โปรไฟล์</Link>
                  </li>
                  <li>
                    <IoMdSettings />
                    <a href="#">ตั้งค่า</a>
                  </li>
                  <li>
                    <IoIosStats />
                    <a href="#">สถิติ</a>
                  </li>
                  <li>
                    <IoIosHelpCircleOutline />
                    <a href="#">ช่วยเหลือ</a>
                  </li>
                  <li>
                    <IoLogOutOutline />
                    <a href="#" onClick={handleLogout}>
                      ออกจากระบบ
                    </a>
                  </li>
                </ul>
                
              </div> */}
            <Dropdown show={dropdownOpen} onToggle={() => setDropdownOpen(false)}>
              <Dropdown.Menu style={{ right: "-40px", top: "8px" }}>
                <Dropdown.Item href={`/profile/${userId}`}>
                  <div className="d-flex">
                    <FaUser style={{ fontSize: "20px", marginRight: "15px" }} />
                    <p className="m-0">โปรไฟล์</p>
                  </div>
                </Dropdown.Item>
                <Dropdown.Item href={`/account/perference/${userId}`}>
                  <div className="d-flex">
                    <IoMdSettings style={{ fontSize: "20px", marginRight: "15px" }} />
                    <p className="m-0">ตั้งค่า</p>
                  </div>
                </Dropdown.Item>
                <Dropdown.Item href="#/action-3">
                  <div className="d-flex">
                    <IoIosStats style={{ fontSize: "20px", marginRight: "15px" }} />
                    <p className="m-0">สถิติ</p>
                  </div>
                </Dropdown.Item>
                <Dropdown.Item href="/helpcentre">
                  <div className="d-flex">
                    <div className="d-flex">
                      <IoIosHelpCircleOutline style={{ fontSize: "20px", marginRight: "15px" }} />
                      <p className="m-0">ช่วยเหลือ</p>
                    </div>
                  </div>
                </Dropdown.Item>
                <Dropdown.Item>
                  <div className="d-flex" onClick={handleLogout}>
                    <IoLogOutOutline style={{ fontSize: "20px", marginRight: "15px" }} />
                    <p className="m-0">ออกจากระบบ</p>
                  </div>
                </Dropdown.Item>
              </Dropdown.Menu>
            </Dropdown>
            {/* )} */}
          </div>

          <div className="bx bx-menu" id="menu-icon">
            <RxHamburgerMenu />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Navbar1;
