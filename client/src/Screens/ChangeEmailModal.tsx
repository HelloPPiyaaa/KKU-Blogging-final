import React from "react";
import { Modal, Button } from "react-bootstrap";

interface ChangeEmailModalProps {
  show: boolean;
  onClose: () => void;
  onSave: (email: string) => void;
  oldEmail: string;
}

const ChangeEmailModal: React.FC<ChangeEmailModalProps> = ({
  show,
  onClose,
  onSave,
  oldEmail,
}) => {
  const [email, setEmail] = React.useState("");

  const handleSave = () => {
    if (email) {
      onSave(email);
      setEmail("");
    } else {
      alert("Please enter a valid email.");
    }
  };

  return (
    <Modal show={show} onHide={onClose}>
      <Modal.Header closeButton>
        <Modal.Title>Change Email</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <input
          type="email"
          placeholder="Enter new email"
          value={email || oldEmail}
          onChange={(e) => setEmail(e.target.value)}
          className="form-control"
        />
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onClose}>
          Cancel
        </Button>
        <Button variant="primary" onClick={handleSave}>
          Save
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default ChangeEmailModal;
