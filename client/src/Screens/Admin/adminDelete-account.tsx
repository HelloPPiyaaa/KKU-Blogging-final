import React, { useState } from "react";
import { Modal, Button, Form } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const DeleteAdminAccountModal: React.FC<{
  userId: string | null;
  show: boolean;
  onClose: () => void;
  onDeleteSuccess: () => void;
}> = ({ userId, show, onClose, onDeleteSuccess }) => {
  const [adminPassword, setAdminPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const API_BASE_URL = process.env.REACT_APP_API_ENDPOINT;
  const navigate = useNavigate();

  const handleDeleteAccount = async () => {
    try {
      const response = await axios.delete(
        `${API_BASE_URL}/profile/edit-profile/delete/${userId}`,
        {
          data: { adminPassword , adminId:sessionStorage.getItem("adminId") },
        }
      );
      
      if (response.data.message === "User deleted successfully") {
        setSuccessMessage("ลบบัญชีผู้ใช้สำเร็จ!");
        setErrorMessage("");
        onDeleteSuccess();
      } else {
        setErrorMessage(response.data.error || "เกิดข้อผิดพลาดในการลบผู้ใช้");
      }
    } catch (error) {
      setErrorMessage("ไม่สามารถลบบัญชีได้ โปรดตรวจสอบรหัสผ่านของผู้ดูแลอีกครั้ง");
    }
  };

  return (
    <Modal show={show} onHide={onClose} centered>
      <Modal.Header closeButton>
        <Modal.Title>ลบบัญชีผู้ใช้</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <p>คุณแน่ใจหรือไม่ว่าต้องการลบบัญชีของผู้ใช้นี้?</p>
        <Form onSubmit={(e) => e.preventDefault()}>
          <Form.Group controlId="adminPassword">
            <Form.Label>กรอกรหัสผ่านของผู้ดูแลระบบเพื่อยืนยันการลบ</Form.Label>
            <Form.Control
              type="password"
              placeholder="กรอกรหัสผ่านของแอดมิน"
              value={adminPassword}
              onChange={(e) => setAdminPassword(e.target.value)}
            />
          </Form.Group>

          {errorMessage && <p className="text-danger">{errorMessage}</p>}
          {successMessage && <p className="text-success">{successMessage}</p>}
        </Form>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onClose}>
          ยกเลิก
        </Button>
        <Button variant="danger" onClick={handleDeleteAccount}>
          ยืนยันการลบ
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default DeleteAdminAccountModal;
