import { useContext, useEffect, useRef, useState } from "react";
import { UserContext } from "../App";
import { Navigate, NavLink, Outlet } from "react-router-dom";
import { IoDocumentTextOutline, IoRemoveCircleOutline } from "react-icons/io5";
import { LuFileEdit } from "react-icons/lu";
import { IoNotificationsOutline } from "react-icons/io5";
import { LuUser2 } from "react-icons/lu";
import { SlLock } from "react-icons/sl";
import { RxHamburgerMenu } from "react-icons/rx";
import "../misc/blogpage.css";
import { lookInSession, removeFromSession } from "../common/session";
import DeleteAccountModalUser from "../Screens/DeleteAccount-confirm-user";

const SideNav = () => {
  let {
    userAuth: { new_notification_available },
  } = useContext(UserContext);

  const [access_token, setAccessToken] = useState<string | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  useEffect(() => {
    const userInSession = lookInSession("user");
    if (userInSession) {
      console.log(JSON.parse(userInSession).access_token);
      setAccessToken(JSON.parse(userInSession).access_token);
    } else {
      window.location.href = "/signin";
    }
  }, []);

  let page = window.location.pathname.split("/")[2];

  let [pageState, setPageState] = useState(page.replace("-", " "));
  let [showSideNav, setShowSideNav] = useState(false);

  const activeTabLine = useRef<HTMLHRElement | null>(null);
  const sideBarIconTab = useRef<HTMLButtonElement | null>(null);
  const pageStateTab = useRef<HTMLButtonElement | null>(null);

  const userId = sessionStorage.getItem("userId");

  const {
    userAuth: { username },
    setUserAuth,
  } = useContext(UserContext);

  const handleDeleteSuccess = () => {
    setShowDeleteModal(false);
    alert("Your account has been deleted.");
    removeFromSession("user");
    setUserAuth({ access_token: null });
    window.location.href = "/";
  };

  const changePageState = (e: React.MouseEvent<HTMLElement>) => {
    let { offsetWidth, offsetLeft } = e.currentTarget as HTMLElement;

    if (activeTabLine.current) {
      const tabLineElement = activeTabLine.current as HTMLElement;
      tabLineElement.style.width = `${offsetWidth}px`;
      tabLineElement.style.left = `${offsetLeft}px`;
    }

    if (e.currentTarget === sideBarIconTab.current) {
      setShowSideNav(true);
    } else {
      setShowSideNav(false);
    }
  };

  useEffect(() => {
    setShowSideNav(false);
    pageStateTab.current?.click();
  }, [pageState]);

  return (
    <>
      <section className="section-editpage gap-2 py-0 m-0 ">
        <div className="position-sticky" style={{ top: "80px", zIndex: "30" }}>
          <div className="button-faBars">
            <button
              ref={sideBarIconTab}
              className="p-3 "
              style={{ textTransform: "capitalize" }}
              onClick={changePageState}
            >
              <RxHamburgerMenu style={{ pointerEvents: "none" }} />
            </button>

            <button
              ref={pageStateTab}
              className="p-3 "
              style={{ textTransform: "capitalize" }}
              onClick={changePageState}
            >
              {pageState}
            </button>
            <hr
              ref={activeTabLine}
              className="position-absolute bottom-0"
              style={{ transitionDuration: "500ms" }}
            />
          </div>

          <div className={`edit-form ${showSideNav ? "active" : ""}`}>
            <h1
              className="mb-3"
              style={{ color: "#494949", fontSize: "16px"}}
            >
              แดชบอร์ด
            </h1>
            <hr
              className="border-grey"
              style={{
                marginLeft: "-24px",
                marginBottom: "32px",
                marginRight: "24px",
              }}
            />

            <NavLink
              to="/dashboard/blogs"
              onClick={(e) => setPageState(e.currentTarget.innerText)}
              className="sidebar-link"
            >
              <IoDocumentTextOutline />
              บล็อก
            </NavLink>

            <NavLink
              to="/dashboard/notifications"
              onClick={(e) => setPageState(e.currentTarget.innerText)}
              className="sidebar-link"
            >
              <div className="position-relative">
                <IoNotificationsOutline />
                {new_notification_available ? (
                  <span
                    className="rounded-circle position-absolute z-10"
                    style={{
                      backgroundColor: "red",
                      width: "0.5rem",
                      height: "0.5rem",
                      zIndex: 10,
                      top: "0rem",
                      transform: "translateX(-3px)",
                    }}
                  ></span>
                ) : (
                  ""
                )}
              </div>
              การแจ้งเตือน
            </NavLink>

            <NavLink
              to="/editor"
              onClick={(e) => setPageState(e.currentTarget.innerText)}
              className="sidebar-link"
            >
              <LuFileEdit />
              เขียน
            </NavLink>

            <NavLink
              to="/dashboard/reportCheck" // ✅ path ตรงกับ Route แล้ว
              onClick={(e) => setPageState(e.currentTarget.innerText)}
              className="sidebar-link"
            >
              <LuFileEdit />
              รายงานปัญหา
            </NavLink>

            <h1
              className="mb-3 mt-4"
              style={{ color: "#494949", fontSize: "16px" }}
            >
              ตั้งค่า
            </h1>
            <hr
              className="border-grey"
              style={{
                marginLeft: "-24px",
                marginBottom: "32px",
                marginRight: "24px",
              }}
            />

            <NavLink
              to="/settings/edit-profile"
              onClick={(e) => setPageState(e.currentTarget.innerText)}
              className="sidebar-link"
            >
              <LuUser2 />
              แก้ไขโปรไฟล์
            </NavLink>

            <NavLink
              to="/settings/change-password"
              onClick={(e) => setPageState(e.currentTarget.innerText)}
              className="sidebar-link"
            >
              <SlLock />
              เปลี่ยนรหัสผ่าน
            </NavLink>
            <NavLink
              to="/settings/noti-setting"
              onClick={(e) => setPageState(e.currentTarget.innerText)}
              className="sidebar-link"
            >
              <IoNotificationsOutline />
              การแจ้งเตือน
            </NavLink>

            <div
              className="delete-ac-btn"
              onClick={() => setShowDeleteModal(true)}
            >
              <IoRemoveCircleOutline />
              <p>ลบบัญชีผู้ใช้</p>
            </div>
          </div>
        </div>

        <div className="mt-5 w-100 out-let">
          <Outlet />
        </div>
      </section>
      <DeleteAccountModalUser
        userId={userId}
        show={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onDeleteSuccess={handleDeleteSuccess}
      />
    </>
  );
};

export default SideNav;
