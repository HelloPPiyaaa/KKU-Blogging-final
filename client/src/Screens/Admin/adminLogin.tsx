import { useState, useEffect, useRef, useContext } from "react";
import logohead from "../../pic/logo-headV2.png";
import "../../misc/login.css";
import { Link, useNavigate } from "react-router-dom";
import { UserContext } from "../../App";
import toast from "react-hot-toast";
import {
  storeInSession,
  userInSession,
  userIdInSession,
} from "../../common/session";

interface LoginPageProps {
  type: string;
}

const Login: React.FC<LoginPageProps> = ({ type }) => {
  const authForm = useRef<HTMLFormElement>(null);
  const API_URL = process.env.REACT_APP_API_ENDPOINT;
  const navigate = useNavigate();

  const {
    userAuth: { access_token },
    setUserAuth,
  } = useContext(UserContext);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [alertMessage, setAlertMessage] = useState<string | null>(null);

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
        if (!response.ok) {
          return response.json().then((errorData) => {
            throw new Error(errorData.error || "Error occurred");
          });
        }
        return response.json();
      })
      .then((data) => {
        storeInSession("user", JSON.stringify(data));
        setUserAuth(data);
        userInSession("userId", data.username);
        userIdInSession("adminId", data._id);
        navigate(`/admin/${data._id}`);
      })
      .catch((error) => {
        // Set the error message in the alertMessage state
        setAlertMessage(error.message); // Use the error message
        toast.error(error.message);
      });
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setAlertMessage(null); // Clear any previous error messages
    userAuthThroughServer("/admin", { email, password });
  };

  return (
    <div className="login-container">
      <main>
        <div className="box">
          <div className="inner-box">
            <div className="forms-wrap">
              <form
                autoComplete="off"
                className="sign-in-form"
                onSubmit={handleSubmit}
                ref={authForm}
              >
                <div className="logo">
                  <img src={logohead} alt="easyclass" />
                </div>

                <div
                  className="heading"
                  style={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    height: "10vh", // หรือปรับความสูงที่เหมาะสม
                    textAlign: "center",
                  }}
                >
                  <h2>ยินดีต้อนรับผู้ดูแลระบบ</h2>
                </div>

                <div className="actual-form">
                  <p>อีเมล</p>
                  <div className="input-wrap">
                    <input
                      type="email"
                      minLength={4}
                      className="input-field"
                      autoComplete="off"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>
                  <div className="input-wrap">
                    <p>รหัสผ่าน</p>
                    <input
                      type="password"
                      minLength={4}
                      className="input-field"
                      autoComplete="off"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                  </div>

                  {alertMessage && (
                    <h3
                      className="error-message"
                      style={{ color: "red", fontSize: "1rem" }}
                    >
                      {alertMessage}
                    </h3>
                  )}

                  <button
                    type="submit"
                    className="sign-btn"
                    style={{
                      marginTop: "50px", // กำหนดระยะห่างด้านบน
                    }}
                  >
                    เข้าสู่ระบบ
                  </button>

                  <p className="text">
                    <Link to="/forgot-password">ลืมรหัสผ่าน</Link>{" "}
                    ในการเข้าสู่ระบบ
                  </p>
                </div>
              </form>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Login;
