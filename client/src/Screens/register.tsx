// RegisterForm.tsx
import { useState, useEffect } from "react";
import { registerUser } from "../api/register";
import "../misc/register.css";
import Form from "react-bootstrap/Form";
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import { FaCheckCircle } from "react-icons/fa";
import { IoCloseCircle } from "react-icons/io5";
import FacebookLogin, {
  ReactFacebookLoginInfo,
  ReactFacebookFailureResponse,
} from "react-facebook-login";
import { BiLogoFacebookSquare } from "react-icons/bi";
import GoogleLogin from "react-google-login";
import { gapi } from "gapi-script";
import { FcGoogle } from "react-icons/fc";

const RegisterForm: React.FC = () => {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [tel, setTel] = useState("");
  const [firstname, setFirstname] = useState("");
  const [lastname, setLastname] = useState("");
  const [date_of_birth, setDateOfBirth] = useState("");
  const [gender, setGender] = useState("");
  const [alertMessage, setAlertMessage] = useState<string | null>(null);
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [passwordMatchError, setPasswordMatchError] = useState(false);
  const [facebookData, setFacebookData] =
    useState<ReactFacebookLoginInfo | null>(null);

  const handleAlertClose = () => {
    setAlertMessage(null);
  };

  const displayAlert = (message: string) => {
    setAlertMessage(message);
  };
  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value);
    setPasswordMatchError(false);
  };

  const handlePasswordConfirmChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setPasswordConfirm(e.target.value);
    setPasswordMatchError(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password !== passwordConfirm) {
      // ถ้ารหัสผ่านไม่ตรงกัน แสดงข้อความแจ้งเตือนและยกเลิกการส่งฟอร์ม
      setPasswordMatchError(true);
      return;
    }

    try {
      const user = {
        username,
        email,
        password,
        tel,
        firstname,
        lastname,
        gender,
        date_of_birth,
      };
      const response = await registerUser(user);
      console.log(response); // ตรวจสอบ response ใน Console Log

      if (response) {
        sessionStorage.setItem("userId", response._id);
        displayAlert("ลงทะเบียนสำเร็จ!");
      } else {
        displayAlert("ลงทะเบียนไม่สำเร็จ!");
      }
    } catch (error) {
      console.error("Registration failed:", error);

      displayAlert("คุณมีบัญชีอยู่แล้ว โปรดเข้าสู่ระบบ");
    }
  };

  const responseGoogle = async (response: any) => {
    try {
      const googleAuth = gapi.auth2.getAuthInstance();
      const googleUser = await googleAuth.signIn();

      if (googleUser && googleUser.getBasicProfile()) {
        const profile = googleUser.getBasicProfile();

        const user = {
          username: profile.getName(),
          email: profile.getEmail(),
          password: profile.getId(), // ใช้ Google ID เป็น password ชั่วคราว
          tel,
          firstname,
          lastname,
          gender,
          date_of_birth,
        };

        const registerResponse = await registerUser(user);

        if (registerResponse) {
          sessionStorage.setItem("userId", registerResponse._id);
          displayAlert("ลงทะเบียนสำเร็จ!");
        } else {
          displayAlert("ลงทะเบียนไม่สำเร็จ!");
        }
      } else {
        console.error("Google registration failed: Invalid response", response);
        displayAlert("ลงทะเบียนผ่าน Google ไม่สำเร็จ");
      }
    } catch (error) {
      console.error("Google registration failed:", error);
      displayAlert("ลงทะเบียนผ่าน Google ไม่สำเร็จ");
    }
  };
  useEffect(() => {
    if (facebookData) {
      const { name, email, id } = facebookData;
      const user = {
        username: name || "",
        email: email || "",
        password: id || "",
        tel,
        firstname,
        lastname,
        gender,
        date_of_birth,
      };

      registerUser(user)
        .then((registerResponse) => {
          console.log(registerResponse);
          displayAlert("ลงทะเบียนสำเร็จ!");
        })
        .catch((error) => {
          console.error("Registration failed:", error);
          displayAlert("คุณมีบัญชีอยู่แล้ว โปรดเข้าสู่ระบบ");
        });
    }
  }, [
    facebookData,
    tel,
    firstname,
    lastname,
    gender,
    date_of_birth,
    setFacebookData,
  ]);

  const responseFacebook = async (
    response: ReactFacebookLoginInfo | ReactFacebookFailureResponse
  ) => {
    try {
      if ("name" in response) {
        const { name, email, id } = response;

        const user = {
          username: name || "",
          email: email || "",
          password: id || "",
          tel,
          firstname,
          lastname,
          gender,
          date_of_birth,
        };

        const registerResponse = await registerUser(user);
        console.log(registerResponse);

        displayAlert("ลงทะเบียนสำเร็จ!");
      } else {
        console.error("Facebook registration failed:", response);
        displayAlert("ลงทะเบียนผ่าน Facebook ไม่สำเร็จ");
      }
    } catch (error) {
      console.error("Error during Facebook registration:", error);
      displayAlert("มีข้อผิดพลาดในระหว่างการลงทะเบียนผ่าน Facebook");
    }
  };
  useEffect(() => {
    if (facebookData) {
      const { name, email, id } = facebookData;
      const user = {
        username: name || "",
        email: email || "",
        password: id || "",
        tel,
        firstname,
        lastname,
        gender,
        date_of_birth,
      };
      registerUser(user)
        .then((registerResponse) => {
          console.log(registerResponse);
          displayAlert("ลงทะเบียนสำเร็จ!");
        })
        .catch((error) => {
          console.error("Registration failed:", error);
          displayAlert("คุณมีบัญชีอยู่แล้ว โปรดเข้าสู่ระบบ");
        });
    }
  }, [
    facebookData,
    tel,
    firstname,
    lastname,
    gender,
    date_of_birth,
    setFacebookData,
  ]);

  return (
    <div className="regispage ">
      <Container>
        <Form className="Form1" onSubmit={handleSubmit}>
          <h3>สมัครใช้งาน</h3>

          <Row>
            <Col>
              <Form.Group className="mb-3" controlId="formFirstname">
                <Form.Label>ชื่อ</Form.Label>
                <Form.Control
                  type="text"
                  value={firstname}
                  onChange={(e) => setFirstname(e.target.value)}
                />
              </Form.Group>
            </Col>
            <Col>
              <Form.Group className="mb-3" controlId="formBasicLastname">
                <Form.Label>นามสกุล</Form.Label>
                <Form.Control
                  type="text"
                  value={lastname}
                  onChange={(e) => setLastname(e.target.value)}
                />
              </Form.Group>
            </Col>
          </Row>

          <Row>
            <Col>
              <Form.Group className="mb-3" controlId="formBasicUsername">
                <Form.Label>Username</Form.Label>
                <Form.Control
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                />
              </Form.Group>
            </Col>
            <Col>
              <Form.Group className="mb-3" controlId="formBasicEmail">
                <Form.Label>อีเมล</Form.Label>
                <Form.Control
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </Form.Group>
            </Col>
          </Row>

          <Row>
            <Col>
              <Form.Label>เพศ</Form.Label>
              <Form.Select
                aria-label="เลือกเพศ"
                id="gender"
                name="gender"
                value={gender}
                onChange={(e) => setGender(e.target.value)}
              >
                <option value="ชาย">ชาย</option>
                <option value="หญิง">หญิง</option>
                <option value="อื่นๆ">อื่นๆ</option>
              </Form.Select>
            </Col>
            <Col>
              <Form.Group className="mb-3" controlId="formBasicDate">
                <Form.Label>วันเกิด</Form.Label>
                <Form.Control
                  type="date"
                  value={date_of_birth}
                  onChange={(e) => setDateOfBirth(e.target.value)}
                />
              </Form.Group>
            </Col>
          </Row>

          <Row>
            <Col>
              <Form.Group className="mb-3">
                <Form.Label>เบอร์โทรศัพท์</Form.Label>
                <Form.Control
                  type="tel"
                  value={tel}
                  onChange={(e) => setTel(e.target.value)}
                />
              </Form.Group>
            </Col>
          </Row>

          <Row>
            <Col>
              <Form.Group className="mb-3" controlId="formBasicPassword">
                <Form.Label>ตั้งรหัสผ่าน</Form.Label>
                <Form.Control
                  type="password"
                  value={password}
                  onChange={handlePasswordChange}
                />
              </Form.Group>
            </Col>
            <Col>
              <Form.Group className="mb-3" controlId="formBasicPassword2">
                <Form.Label>ยืนยันรหัสผ่าน</Form.Label>
                <Form.Control
                  type="password"
                  value={passwordConfirm}
                  onChange={handlePasswordConfirmChange}
                />
                {passwordMatchError && (
                  <p style={{ color: "red" }}>รหัสผ่านไม่ตรงกัน</p>
                )}
              </Form.Group>
            </Col>
          </Row>

          <Row style={{ justifyContent: "center" }}>
            <button id="RGbutton">ลงทะเบียน</button>
          </Row>
          <div className="or">
            <div className="line"></div>
            <p className="lineor">or</p>
            <div className="line"></div>
          </div>
          <Row className="justify-content-center">
            <Col xs={12} sm={6} className="mb-3">
              <FacebookLogin
                appId="1049007683071855"
                autoLoad={false}
                fields="name,email,picture"
                callback={responseFacebook}
                cssClass="facebook-regist"
                textButton="สมัครใช้งานโดยบัญชี Facebook"
                icon={<BiLogoFacebookSquare className="facebook-icon" />}
              />
            </Col>

            <Col xs={12} sm={6} className="mb-3">
              <GoogleLogin
                clientId="482979769066-iih3sviotimp52c5e7se1maifspaot0g.apps.googleusercontent.com"
                buttonText="สมัครใช้งานโดยบัญชี Google"
                onSuccess={responseGoogle}
                onFailure={responseGoogle}
                cookiePolicy="single_host_origin"
                className="google-regist"
                render={(renderProps) => (
                  <button
                    onClick={renderProps.onClick}
                    disabled={renderProps.disabled}
                    className="google-bt"
                  >
                    <FcGoogle className="google-icon" />
                    เข้าสู่ระบบผ่านบัญชี Google
                  </button>
                )}
              />
            </Col>
          </Row>
        </Form>
      </Container>

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
    </div>
  );
};

export default RegisterForm;
