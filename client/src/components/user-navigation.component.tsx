import { Link } from "react-router-dom";
import { LuFileEdit } from "react-icons/lu";
import { useContext } from "react";
import { UserContext } from "../App";
import { removeFromSession } from "../common/session";
import "../misc/dropdown-nav.css";
import AnimationWrapper from "../Screens/page-animation";

const UserNavigationPanel = () => {
  const {
    userAuth: { username },
    setUserAuth
  } = useContext(UserContext);
  const userId = sessionStorage.getItem("userId");

  const signOutUser = () => {
    removeFromSession("user");
    setUserAuth({ access_token: null });
  };

  return (
    <AnimationWrapper className="animationwrap" transition={{ duration: 0.2 }}>
      <div className="list-dropdown">
        <Link to="/editor" className="link link-list">
          <LuFileEdit />
          <p className="m-0">เขียน</p>
        </Link>
        <Link to={`/user/${userId}`} className="link pl-8 ">
          โปรไฟล์
        </Link>
        <Link to={`/dashboard/blogs`} className="link pl-8 ">
          แดชบอร์ด
        </Link>
        <Link to={`/settings/edit-profile`} className="link pl-8">
          แก้ไขโปรไฟล์
        </Link>
        <Link to={`/settings/change-password`} className="link pl-8">
          ตั้งค่าบัญชีผู้ใช้
        </Link>
        <Link to={`/helpcentre`} className="link pl-8">
          ช่วยเหลือ
        </Link>

        <span className="position-absolute border-top border-grey w-100"></span>

        <button className="button-signout" onClick={signOutUser}>
          <h1>ออกจากระบบ</h1>
          <p className="m-0" style={{ color: "#555555" }}>
            @{username}
          </p>
        </button>
      </div>
    </AnimationWrapper>
  );
};

export default UserNavigationPanel;
