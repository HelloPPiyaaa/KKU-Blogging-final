import React from "react";

interface ConfirmCancelModalProps {
  showModal: boolean;
  onCancel: () => void;
  onConfirm: () => void;
  handleClose: () => void;
}

const ConfirmCancelModal: React.FC<ConfirmCancelModalProps> = ({
  showModal,
  onCancel,
  onConfirm,
  handleClose,
}) => {
  if (!showModal) return null;

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "rgba(255, 255, 255, 0.6)", // Light foggy white background
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        zIndex: 1000, // Ensures it's above all other content
      }}
    >
      <div
        style={{
          backgroundColor: "#fff", // Bright white background for the modal
          padding: "20px",
          borderRadius: "8px",
          minWidth: "300px",
          textAlign: "center",
          zIndex: 1001, // Ensures the modal content is above the overlay
        }}
      >
        <h3>ยืนยันการยกเลิก</h3>
        <p>คุณแน่ใจหรือไม่ว่าต้องการยกเลิกรายงานนี้?</p>
        <div>
          <button
            style={{
              margin: "10px",
              padding: "5px 10px",
              backgroundColor: "#f44336",
              color: "white",
              border: "none",
              borderRadius: "4px",
            }}
            onClick={onConfirm}
          >
            ยืนยัน
          </button>
          <button
            style={{
              margin: "10px",
              padding: "5px 10px",
              backgroundColor: "#4CAF50",
              color: "white",
              border: "none",
              borderRadius: "4px",
            }}
            onClick={handleClose}
          >
            ยกเลิก
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmCancelModal;
