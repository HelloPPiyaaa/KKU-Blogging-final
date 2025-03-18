import React, { useState } from "react";
import { Modal, Button, Form } from "react-bootstrap";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";

const DeleteAccountModal: React.FC<{
  userId: string | null;
  show: boolean;
  onClose: () => void;
  onDeleteSuccess: () => void;
}> = ({ userId, show, onClose, onDeleteSuccess }) => {
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const API_BASE_URL =
    process.env.REACT_APP_API_ENDPOINT ||
    "https://kku-blog-server-ak2l.onrender.com";
  const navigate = useNavigate();

  const handleDeleteAccount = async () => {
    try {
      const response = await axios.delete(
        `${API_BASE_URL}/profile/edit-profile/delete/${userId}`,
        {
          data: { password },
        }
      );

      if (response.data.message === "User deleted successfully") {
        setSuccessMessage("Account deleted successfully!");
        setErrorMessage("");
        onDeleteSuccess();
        localStorage.removeItem("userId");
        sessionStorage.removeItem("userId");
      } else {
        setErrorMessage(response.data.error);
      }
    } catch (error) {
      setErrorMessage("Error deleting account. Please check your password.");
    }
  };

  return (
    <Modal show={show} onHide={onClose} centered>
      <Modal.Header closeButton>
        <Modal.Title>Delete Account</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <p>
          Are you sure you want to delete your account? This action cannot be
          undone.
        </p>
        <Form>
          <Form.Group controlId="password">
            <Form.Label>Enter your password to confirm</Form.Label>
            <Form.Control
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </Form.Group>

          {errorMessage && <p className="text-danger">{errorMessage}</p>}
          {successMessage && <p className="text-success">{successMessage}</p>}
        </Form>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onClose}>
          Cancel
        </Button>
        <Button variant="danger" onClick={handleDeleteAccount}>
          Delete Account
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default DeleteAccountModal;
