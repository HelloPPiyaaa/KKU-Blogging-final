// RegisterForm.tsx
import { useState } from "react";
// import { registerAdmin } from "../../api/adminlogin-Regist";
import "../../misc/register.css";
import Form from "react-bootstrap/Form";
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import { FaCheckCircle } from "react-icons/fa";
import { IoCloseCircle } from "react-icons/io5";
import { registerAdmin } from "../../api/adminlogin-Regist";
import { useNavigate } from "react-router-dom";

const RegisterAdmin: React.FC = () => {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [tel, setTel] = useState("");
  const [firstname, setFirstname] = useState("");
  const [lastname, setLastname] = useState("");
  const [alertMessage, setAlertMessage] = useState<string | null>(null);
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [passwordMatchError, setPasswordMatchError] = useState(false);
  const navigate = useNavigate();

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

  const handlePasswordConfirmChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPasswordConfirm(e.target.value);
    setPasswordMatchError(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== passwordConfirm) {
      setPasswordMatchError(true);
      return;
    }

    try {
      const admin = {
        username,
        email,
        password,
        tel,
        firstname,
        lastname
      };
      const response = await registerAdmin(admin);
      console.log(response); // ตรวจสอบ response ใน Console Log

      displayAlert("ลงทะเบียนสำเร็จ!");
      navigate("/admin/login");
    } catch (error) {
      console.error("Registration failed:", error);

      displayAlert("คุณมีบัญชีอยู่แล้ว โปรดเข้าสู่ระบบ");
    }
  };

  return (
    <div className="regispage ">
      <Container className="mt-5">
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
              <Form.Group className="mb-3">
                <Form.Label>เบอร์โทรศัพท์</Form.Label>
                <Form.Control type="tel" value={tel} onChange={(e) => setTel(e.target.value)} />
              </Form.Group>
            </Col>
          </Row>

          <Row>
            <Col>
              <Form.Group className="mb-3" controlId="formBasicPassword">
                <Form.Label>ตั้งรหัสผ่าน</Form.Label>
                <Form.Control type="password" value={password} onChange={handlePasswordChange} />
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
                {passwordMatchError && <p style={{ color: "red" }}>รหัสผ่านไม่ตรงกัน</p>}
              </Form.Group>
            </Col>
          </Row>

          <Row style={{ justifyContent: "center" }}>
            <button id="RGbutton">ลงทะเบียน</button>
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

export default RegisterAdmin;
