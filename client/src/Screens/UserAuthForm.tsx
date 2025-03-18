import "../misc/signup.css";
import InputBox from "../components/input.component";
import googleIcon from "../pic/google.png";
import { Link, Navigate } from "react-router-dom";
import AnimationWrapper from "./page-animation";
import { useContext, useEffect, useRef } from "react";
import { Toaster, toast } from "react-hot-toast";
import { storeInSession, userInSession } from "../common/session";
import { UserContext } from "../App";
import { authWithGoogle } from "../common/firebase";

interface LoginPageProps {
  type: string;
}

const UserAuthForm: React.FC<LoginPageProps> = ({ type }) => {
  const authForm = useRef<HTMLFormElement>(null);
  const API_URL =
    process.env.REACT_APP_API_ENDPOINT ||
    "https://kku-blog-server-ak2l.onrender.com";

  const {
    userAuth: { access_token },
    setUserAuth,
  } = useContext(UserContext);

  const userAuthThroughServer = (
    serverRoute: string,
    formData: { [key: string]: any }
  ) => {
    fetch(API_URL + serverRoute, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(formData),
    })
      .then((response) => {
        console.log("response", response);
        if (!response.ok) {
          return response.json().then((errorData) => {
            throw new Error(errorData.error || "Error occurred");
          });
        }
        return response.json();
      })
      .then((data) => {
        console.log("data", data);
        storeInSession("user", JSON.stringify(data));
        userInSession("userId", data._id);
        setUserAuth(data);
      })
      .catch((error) => {
        toast.error(error.message);
      });
  };

  const handlesubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const serverRoute = type === "เข้าสู่ระบบ" ? "/signin" : "/signup";

    if (!authForm.current) {
      toast.error("Form not found");
      return;
    }

    let emailRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
    let passwordRegex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{6,20}$/;

    const form = new FormData(authForm.current as HTMLFormElement);
    const formData: { [key: string]: any } = {};

    form.forEach((value, key) => {
      formData[key] = value;
    });

    console.log("formData:", formData);

    const { fullname, email, password } = formData;
    if (fullname) {
      if (fullname.length < 3) {
        return toast.error("ชื่อต้องมีความยาวอย่างน้อย 3 ตัว อักษร");
      }
    }

    if (!email.length) {
      return toast.error("ใส่ Email");
    }
    if (!emailRegex.test(email)) {
      return toast.error("Email ไม่ถูกต้อง");
    }
    if (!passwordRegex.test(password)) {
      return toast.error(
        "รหัสผ่านควรมีความยาว 6-20 ตัวอักษร พร้อมตัวเลข ตัวพิมพ์เล็ก 1 ตัว ตัวพิมพ์ใหญ่ 1 ตัว"
      );
    }
    userAuthThroughServer(serverRoute, formData);
  };

  const handleGoogleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    const userCredential = await authWithGoogle();
    console.log("userCredential", userCredential);

    if (userCredential) {
      const user = userCredential.user;
      const idToken = await user.getIdToken();

      const serverRoute = "/google-auth";
      const formData = {
        access_token: idToken,
      };
      await userAuthThroughServer(serverRoute, formData);
    } else {
      toast.error("การลงชื่อเข้าใช้ล้มเหลว");
    }
  };

  return access_token ? (
    <Navigate to="/homepage" />
  ) : (
    <AnimationWrapper keyValue={type}>
      <Toaster />
      <section className="h-cover d-flex align-items-center justify-content-center">
        <form
          id="formElement"
          ref={authForm}
          className="custom-form"
          style={{ width: "80%", maxWidth: "400px" }}
          onSubmit={handlesubmit}
        >
          <h1
            className="custom-heading"
            style={{
              fontSize: "2.2rem",
              textTransform: "capitalize",
              textAlign: "center",
              marginBottom: "3rem",
            }}
          >
            {type === "เข้าสู่ระบบ"
              ? "ยินดีต้อนรับกลับมา"
              : "เข้าร่วมกับเราวันนี้"}
          </h1>

          {type !== "เข้าสู่ระบบ" ? (
            <InputBox
              name="fullname"
              type="text"
              id="fullname"
              placeholder="Full Name"
              icon="FaUser"
            />
          ) : (
            ""
          )}

          <InputBox
            name="email"
            type="email"
            id="email"
            placeholder="Email"
            icon="MdOutlineMail"
          />
          <InputBox
            name="password"
            type="password"
            id="password"
            placeholder="Password"
            icon="VscKey"
          />

          <p className="text text-r">
            <Link to="/forgot-password-user">ลืมรหัสผ่าน</Link> ในการเข้าสู่ระบบ
          </p>

          <button
            className="btn-dark center"
            style={{ display: "block", margin: "0 auto", marginTop: "3.5rem" }}
            type="submit"
          >
            {type}
          </button>   

          <div className="line-or">
            <hr
              style={{
                width: "50%",
                border: "1px solid black",
              }}
            />
            <p className="m-0">หรือ</p>
            <hr
              style={{
                width: "50%",
                border: "1px solid black",
              }}
            />
          </div>

          <button
            className="btn-dark button-google center"
            onClick={handleGoogleAuth}
          >
            <img
              src={googleIcon}
              alt="googleIcon"
              style={{ width: "1.25rem", height: "auto" }}
            />
            continue with google
          </button>

          {type === "เข้าสู่ระบบ" ? (
            <p className="custom-class">
              ไม่มีบัญชี ?
              <Link to="/signup" className="custom-link">
                เข้าร่วมวันนี้
              </Link>
            </p>
          ) : (
            <p className="custom-class">
              เป็นสมาชิกอยู่แล้ว ?
              <Link to="/signin" className="custom-link">
                เข้าสู่ระบบที่นี่
              </Link>
            </p>
          )}
        </form>
      </section>
    </AnimationWrapper>
  );
};

export default UserAuthForm;
