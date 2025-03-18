import React, { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import {
  Alert,
  AlertProps,
  Box,
  Button,
  Container,
  Typography
} from "@mui/material";
import InputBox from "../../components/input.component";

type Params = {
  token: string;
};

type CustomAlertProps = AlertProps & { show: boolean; message: string };

const ResetPassword: React.FC = () => {
  const navigate = useNavigate();
  const [isLoadingInitialData, setIsLoadingInitialData] = useState(true);
  const { token } = useParams<Params>();

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [alert, setAlert] = useState<CustomAlertProps>({
    show: false,
    message: "",
    severity: "success"
  });

  const callCheckIsTokenValid = () => {
    setIsLoadingInitialData(true);
    axios
      .get(`${process.env.REACT_APP_API_ENDPOINT}/token/check/${token}`)
      .then((res) => {
        if (!res.data.success) {
          toast.error(res.data.message);

          setTimeout(() => {
            navigate("/");
          }, 3000);
        }

        return;
      })
      .catch((err) => {
        toast.error("โทเค็นของคุณไม่ถูกต้อง");
        setTimeout(() => {
          navigate("/");
        }, 3000);
      });
    setIsLoadingInitialData(false);
  };

  useEffect(() => {
    callCheckIsTokenValid();
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (newPassword !== confirmPassword) {
      setAlert({
        show: true,
        message: "รหัสผ่านไม่ตรงกัน",
        severity: "error"
      });

      return;
    }

    // ตรวจสอบเงื่อนไขรหัสผ่าน
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[A-Za-z\d]{6,20}$/; // Regex สำหรับรหัสผ่าน
    if (!passwordRegex.test(newPassword)) {
      setAlert({
        show: true,
        message:
          "รหัสผ่านต้องมีความยาว 6-20 ตัวอักษรและประกอบด้วยอักษรตัวพิมพ์ใหญ่หนึ่งตัว ตัวพิมพ์เล็กหนึ่งตัว และตัวเลขหนึ่งตัว",
        severity: "error"
      });
      return; // หยุดการส่งฟอร์ม
    }

    axios
      .post(`${process.env.REACT_APP_API_ENDPOINT}/reset-password`, {
        token,
        password: newPassword
      })
      .then((res) => {
        if (res.data.success) {
          toast.success(res.data.message);

          setAlert({
            show: true,
            message: res.data.message,
            severity: "success"
          });

          // Redirect to login page after success
          setTimeout(() => {
            window.location.href = "https://kku-client.vercel.app/admin/login"; // Redirect to login page
          }, 3000); // Delay for the user to see success message
        } else {
          toast.error(res.data.message);
        }
      })
      .catch((err) => {
        toast.error(err.response.data.message);
      });
  };

  return (
    <Container
      maxWidth="xs"
      sx={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        minHeight: "100vh", // Ensures the container spans the full height of the viewport
        padding: "10px"
      }}
    >
      <ToastContainer />
      <Box
        sx={{
          padding: "40px 20px",
          borderRadius: "8px",
          backgroundColor: "white",
          width: "100%",
          maxWidth: "400px",
          textAlign: "center"
        }}
      >
        <Typography variant="h4" component="h1" sx={{ marginBottom: "20px", fontWeight: "600" }}>
          ตั้งค่ารหัสผ่านใหม่
        </Typography>

        <Typography variant="body1" sx={{ marginBottom: "20px", color: "#6c757d" }}>
          รหัสผ่านใหม่ควรประกอบด้วยตัวอักษรอย่างน้อย 6 ตัว และมีตัวพิมพ์ใหญ่ ตัวพิมพ์เล็ก
          และตัวเลขผสมกัน
        </Typography>

        {alert.show && (
          <Alert
            severity={alert.severity}
            sx={{ my: "24px", textAlign: "left", borderRadius: "8px" }}
          >
            {alert.message}
          </Alert>
        )}

        <form onSubmit={handleSubmit}>
          <InputBox
            name="password"
            type="password"
            id="password"
            icon="VscKey"
            placeholder="รหัสผ่านใหม่"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            disabled={isLoadingInitialData}
          />

          <InputBox
            name="confirmPassword"
            type="password"
            id="confirmPassword"
            icon="VscKey"
            placeholder="ยืนยันรหัสผ่านใหม่"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            disabled={isLoadingInitialData}
          />

          <Button
            type="submit"
            variant="contained"
            fullWidth
            disableElevation
            sx={{
              backgroundColor: "#000",
              color: "#fff",
              textTransform: "none",
              padding: "10px 0",
              borderRadius: "50px",
              "&:hover": {
                backgroundColor: "#181818"
              }
            }}
          >
            ตั้งค่ารหัสผ่านใหม่
          </Button>
        </form>

        <Box sx={{ marginTop: "20px" }}>
          <Typography variant="body1">
            จำรหัสผ่านได้แล้ว?{" "}
            <Link to="https://kku-client.vercel.app/admin/login" style={{ color: "#635bff", textDecoration: "none" }}>
              เข้าสู่ระบบ
            </Link>
          </Typography>
        </Box>
      </Box>
    </Container>
  );
};

export default ResetPassword;
