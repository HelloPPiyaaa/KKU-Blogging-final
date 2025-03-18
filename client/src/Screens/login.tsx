import { useState, useEffect, useCallback } from "react";
import { FaCheckCircle } from "react-icons/fa";
import { IoCloseCircle } from "react-icons/io5";
import logohead from "../pic/logo-headV2.png";
import bglogin from "../pic/bg1.png";
import "../misc/login.css";
import { Link } from "react-router-dom";

const Login: React.FC = () => {
  const [alertMessage, setAlertMessage] = useState<string | null>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [userId, setUserId] = useState<string | undefined>(undefined);

  const [username, setUsername] = useState("");
  const [tel, setTel] = useState("");
  const [firstname, setFirstname] = useState("");
  const [lastname, setLastname] = useState("");
  const [date_of_birth, setDateOfBirth] = useState("");
  const [gender, setGender] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [passwordMatchError, setPasswordMatchError] = useState(false);

  useEffect(() => {
    const toggleBtns = document.querySelectorAll<HTMLAnchorElement>(".toggle");
    const mainElement = document.querySelector<HTMLElement>("main");
    const bulletElements = document.querySelectorAll<HTMLElement>(".bullets span");

    const handleFocus = (inp: HTMLInputElement) => {
      inp.classList.add("active");
    };

    const handleBlur = (inp: HTMLInputElement) => {
      if (inp.value === "") {
        inp.classList.remove("active");
      }
    };

    const handleToggleClick = () => {
      mainElement?.classList.toggle("sign-up-mode");
    };

    const moveSlider = (event: Event) => {
      const index = (event.currentTarget as HTMLElement).dataset.value;
      const currentImage = document.querySelector<HTMLImageElement>(`.img-${index}`);
      const textSlider = document.querySelector<HTMLElement>(".text-group");

      if (currentImage && textSlider) {
        bulletElements.forEach((bull) => bull.classList.remove("active"));
        (event.currentTarget as HTMLElement).classList.add("active");

        const allImages = document.querySelectorAll<HTMLImageElement>(".image");
        allImages.forEach((img) => img.classList.remove("show"));

        currentImage.classList.add("show");
        textSlider.style.transform = `translateY(${-(parseInt(index || "1", 10) - 1) * 2.2}rem)`;
      }
    };

    toggleBtns.forEach((btn) => btn.addEventListener("click", handleToggleClick));
    bulletElements.forEach((bullet) => bullet.addEventListener("click", moveSlider));

    const inputs = document.querySelectorAll<HTMLInputElement>(".input-field");
    inputs.forEach((inp) => {
      inp.addEventListener("focus", () => handleFocus(inp));
      inp.addEventListener("blur", () => handleBlur(inp));
    });

    return () => {
      toggleBtns.forEach((btn) => btn.removeEventListener("click", handleToggleClick));
      bulletElements.forEach((bullet) => bullet.removeEventListener("click", moveSlider));
      inputs.forEach((inp) => {
        inp.removeEventListener("focus", () => handleFocus(inp));
        inp.removeEventListener("blur", () => handleBlur(inp));
      });
    };
  }, []);

  const handleAlertClose = useCallback(() => {
    setAlertMessage(null);
  }, []);

  const displayAlert = useCallback((message: string) => {
    setAlertMessage(message);
  }, []);

  const handleLogin = useCallback(async () => {
    try {
      const url = `https://kku-blog-server-ak2l.onrender.com/login`;

      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        credentials: "include", // Make sure the backend supports credentials with CORS
        body: JSON.stringify({ action: "login", email, password })
      });

      // Handle non-2xx HTTP status codes
      if (!response.ok) {
        const statusText = response.statusText || "Unknown Error";
        throw new Error(`Server returned ${response.status} ${statusText} for ${url}`);
      }

      const contentType = response.headers.get("content-type");
      let responseData;

      if (!contentType || !contentType.includes("application/json")) {
        responseData = await response.text();
      } else {
        responseData = await response.json();
      }

      if (responseData.success) {
        if (responseData.id) {
          try {
            localStorage.setItem("userId", responseData.id);
            setUserId(responseData.id);
            window.location.href = "/";
            displayAlert("เข้าสู่ระบบสำเร็จ");
          } catch (storageError) {
            console.error("Failed to save userId in localStorage", storageError);
            displayAlert("Failed to save user session");
          }
        } else {
          console.error("Response does not contain ID:", responseData);
          displayAlert("Response does not contain ID");
        }
      } else {
        displayAlert("อีเมลหรือรหัสผ่านไม่ถูกต้อง");
      }
    } catch (error: any) {
      console.error("Error:", error.message);

      if (error instanceof TypeError) {
        console.error("Network error or CORS issue");
        displayAlert("Network error or CORS issue. Please try again.");
      } else if (error instanceof SyntaxError) {
        console.error("Error parsing JSON response");
        displayAlert("Error parsing server response. Please try again.");
      } else {
        displayAlert("โปรดลองอีกครั้ง");
      }
    }
  }, [email, password, displayAlert]);

  const handleSubmit = async (e: React.FormEvent) => {
    try {
      const user = {
        action: "register",
        username,
        email,
        password,
        tel,
        firstname,
        lastname,
        gender,
        date_of_birth
      };

      const response = await fetch("https://kku-blog-server-ak2l.onrender.com/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        credentials: "include",
        body: JSON.stringify(user)
      });

      const responseData = await response.json();

      if (responseData.success) {
        displayAlert("ลงทะเบียนสำเร็จ!");
      } else {
        displayAlert(responseData.message || "ลงทะเบียนไม่สำเร็จ");
      }
    } catch (error) {
      console.error("Registration failed:", error);
      displayAlert("ลงทะเบียนไม่สำเร็จ");
    }
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
                onSubmit={(e) => e.preventDefault()}
              >
                <div className="logo">
                  <img src={logohead} alt="easyclass" />
                </div>

                <div className="heading">
                  <h2>Welcome Back</h2>
                  <h6>ยังไม่ได้ลงทะเบียน?</h6>
                  <a href="#" className="toggle">
                    ลงทะเบียน
                  </a>
                </div>

                <div className="actual-form">
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
                    <label className="label-login">อีเมล</label>
                  </div>
                  <div className="input-wrap">
                    <input
                      type="password"
                      minLength={4}
                      className="input-field"
                      autoComplete="off"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                    <label className="label-login">รหัสผ่าน</label>
                  </div>

                  {/* Changed type to 'button' to prevent form submission */}
                  <button type="button" className="sign-btn" onClick={handleLogin}>
                    เข้าสู่ระบบ
                  </button>

                  <p className="text">
                    <Link to="/forgot-password">ลืมรหัสผ่าน</Link> ในการเข้าสู่ระบบ
                  </p>
                </div>
              </form>

              <form autoComplete="off" className="sign-up-form" onSubmit={handleSubmit}>
                <div className="logo">
                  <img src={logohead} alt="easyclass" />
                </div>

                <div className="heading">
                  <h2>เริ่มต้นใช้งาน</h2>
                  <h6>มีบัญชีอยู่แล้ว?</h6>
                  <a href="#" className="toggle">
                    เข้าสู่ระบบ
                  </a>
                </div>

                <div className="actual-form">
                  <div className="input-wrap">
                    <input
                      type="text"
                      minLength={4}
                      className="input-field"
                      autoComplete="off"
                      value={firstname}
                      onChange={(e) => setFirstname(e.target.value)}
                      required
                    />
                    <label className="label-login">ชื่อ</label>
                  </div>

                  <div className="input-wrap">
                    <input
                      type="text"
                      minLength={4}
                      className="input-field"
                      autoComplete="off"
                      required
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                    />
                    <label className="label-login">Username</label>
                  </div>

                  <div className="input-wrap">
                    <input
                      type="email"
                      className="input-field"
                      autoComplete="off"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                    <label className="label-login">อีเมล</label>
                  </div>

                  <div className="input-wrap">
                    <input
                      type="password"
                      minLength={4}
                      className="input-field"
                      autoComplete="off"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                    <label className="label-login">รหัสผ่าน</label>
                  </div>

                  <input type="submit" value="ลงทะเบียน" className="sign-btn" />

                  <p className="text">
                    โดยการลงทะเบียน ฉันยอมรับ
                    <a href="#">ข้อกำหนดและเงื่อนไข</a> และ
                    <a href="#">นโยบายความเป็นส่วนตัว</a>
                  </p>
                </div>
              </form>
            </div>

            <div className="carousell">
              <div className="images-wrapper">
                <img src="../" className="image img-1 show" alt="" />
                <img src="./img/image2.png" className="image img-2" alt="" />
                <img src="./img/image3.png" className="image img-3" alt="" />
              </div>

              <div className="text-slider">
                <div className="text-wrap">
                  <div className="text-group">
                    <h2>สร้างประสบการณ์ของคุณเอง</h2>
                    <h2>แลกเปลี่ยนความคิดเห็นกับผู้อื่น</h2>
                    <h2>หาความรู้กับบุคคลทั่วไป</h2>
                  </div>
                </div>

                <div className="bullets">
                  <span className="active" data-value="1"></span>
                  <span data-value="2"></span>
                  <span data-value="3"></span>
                </div>
              </div>
            </div>
          </div>
        </div>
        {alertMessage && (
          <div className="alert-overlay">
            <div className="alertbox">
              {alertMessage.includes("สำเร็จ") ? (
                <FaCheckCircle style={{ color: "#28a745", fontSize: "32px" }} />
              ) : (
                <IoCloseCircle style={{ color: "#dc3545", fontSize: "32px" }} />
              )}
              <p>{alertMessage}</p>
              <button className="btnClose" onClick={handleAlertClose}>
                ปิด
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default Login;
