import React, { useState, useEffect, useMemo } from "react";
import { PiUsersThreeFill } from "react-icons/pi";
import { LuView } from "react-icons/lu";
import { updateUserAPI } from "../../api/adminProfile";
import { useNavigate, useParams } from "react-router-dom";
import { Button, Modal, Form } from "react-bootstrap";
import axios from "axios";
import { AiFillEye, AiFillEyeInvisible } from "react-icons/ai"; // Import eye icons
import DeleteAccountModal from "../DeleteAccount-confirm";
import DeleteAdminAccountModal from "./adminDelete-account";

interface UserProps {
  users: any[];
  allUsers: any[];
}

const ManageUser: React.FC<UserProps> = ({ users, allUsers }) => {
  const { id } = useParams<{ id: string }>();
  const [email, setEmail] = useState("");
  const [fullname, setFullname] = useState("");

  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [fetchUserData, setFetchUserData] = useState<any>([]);

  const [passwordVisibility, setPasswordVisibility] = useState<{
    [key: string]: boolean;
  }>({});
  const [searchKeyword, setSearchKeyword] = useState("");

  const API_BASE_URL = process.env.REACT_APP_API_ENDPOINT;
  const navigate = useNavigate();

  const handleEditUser = (user: any) => {
    setSelectedUser(user);
    setFullname(user.fullname);
    setEmail(user.email);
    setShowEditModal(true);
  };

  const handleDeleteUser = async (userId: string) => {
    setSelectedUser(userId);
    setShowDeleteModal(true);
  };

  const handleModalClose = () => {
    setShowEditModal(false);
    setFullname("");
    setEmail("");
    setSelectedUser(null);
  };

  const handleUpdateUser = async () => {
    try {
      await updateUserAPI(selectedUser._id, fullname, email);
      setShowEditModal(false);
      fetchUsers();
    } catch (error: any) {
      if (error.message.includes("Email is already in use.")) {
        alert("This email is already in use. Please choose another one.");
      } else {
        console.error("Failed to update user:", error);
      }
    }
  };

  // Toggle password visibility สำหรับผู้ใช้แต่ละคน
  const togglePasswordVisibility = (userId: string) => {
    setPasswordVisibility((prev) => ({
      ...prev,
      [userId]: !prev[userId],
    }));
  };

  const handleDeleteSuccess = () => {
    setShowDeleteModal(false);
    fetchUsers();
    alert("User account has been deleted.");
  };

  const fetchUsers = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/profile`);
      setFetchUserData(response.data);
    } catch (error) {
      console.error("Error fetching reports:", error);
    }
  };

  // กำหนดรายชื่อผู้ใช้ที่จะนำไปค้นหา:
  // หาก fetchUserData มีข้อมูลให้ใช้ fetchUserData ถ้าไม่มีให้ใช้ allUsers
  const userList =
    fetchUserData && fetchUserData.length > 0 ? fetchUserData : allUsers;

  // คำนวณรายชื่อผู้ใช้ที่ค้นหา (filtered) ตาม searchKeyword (ค้นหาจาก fullname และ email)
  const filteredUsers = useMemo(() => {
    if (!searchKeyword) return userList;
    return userList.filter(
      (u: any) =>
        u.fullname.toLowerCase().includes(searchKeyword.toLowerCase()) ||
        u.email.toLowerCase().includes(searchKeyword.toLowerCase())
    );
  }, [userList, searchKeyword]);

  return (
    <div className="manageUser">
      <div className="main1">
        <h2
          style={{
            fontSize: "1.8rem",
            fontWeight: "800",
            marginTop: "2rem",
          }}
        >
          จัดการบัญชีผู้ใช้
        </h2>

        <div className="insights">
          <div className="user-all">
            <PiUsersThreeFill className="svg1" />
            <div className="middle">
              <div className="left">
                <h3>ผู้ใช้ทั้งหมด</h3>
                <h1>{allUsers.length}</h1>
              </div>
            </div>
          </div>

          <div className="view-all">
            <LuView className="svg2" />
            <div className="middle">
              <div className="left">
                <h3>ผู้ใช้ใหม่ใน 24 ชั่วโมง</h3>
                <h1>{users.length}</h1>
              </div>
            </div>
          </div>
        </div>

        <div className="recent-order" style={{ marginTop: "1.5rem" }}>
          <h2 style={{ marginLeft: "2px" }}>รายการ</h2>
          {/* ช่องค้นหาผู้ใช้ */}
          {/* เพิ่มเติม: เเก้ Css search-user , input */}
          <div className="search-user">
            <input
              type="text"
              placeholder="ค้นหาผู้ใช้..."
              value={searchKeyword}
              onChange={(e) => setSearchKeyword(e.target.value)}
              style={{
                width: "96%",
                margin: "3px 3px",
                padding: "10px 15px",
                fontSize: "16px",
                border: "none",
                borderRadius: "10px",
                backgroundColor: "white",
              }}
            />
          </div>

          <div className="right">
            <div
              className="activity-analytics"
              style={{
                marginTop: "0.5rem",
                overflowY: "scroll",
                maxHeight: "300px",
              }}
            >
              <table>
                <thead
                  className="pt-5"
                  style={{ margin: "20px 10px", backgroundColor: "white" }}
                >
                  <tr>
                    <th
                      style={{
                        position: "sticky",
                        top: 0,
                        backgroundColor: "#fff",
                        zIndex: 1,
                      }}
                    >
                      วันที่
                    </th>
                    <th
                      style={{
                        position: "sticky",
                        top: 0,
                        backgroundColor: "#fff",
                        zIndex: 1,
                      }}
                    >
                      ชื่อบัญชีผู้ใช้
                    </th>
                    <th
                      style={{
                        position: "sticky",
                        top: 0,
                        backgroundColor: "#fff",
                        zIndex: 1,
                      }}
                    >
                      อีเมล
                    </th>
                    <th
                      style={{
                        position: "sticky",
                        top: 0,
                        backgroundColor: "#fff",
                        zIndex: 1,
                      }}
                    >
                      รหัสผ่าน
                    </th>
                    <th
                      style={{
                        position: "sticky",
                        top: 0,
                        backgroundColor: "#fff",
                        zIndex: 1,
                      }}
                    ></th>
                    <th
                      style={{
                        position: "sticky",
                        top: 0,
                        backgroundColor: "#fff",
                        zIndex: 1,
                      }}
                    ></th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.length > 0 ? (
                    filteredUsers.map((u: any) => (
                      <tr key={u._id}>
                        <td>{new Date(u.joinedAt).toLocaleDateString()}</td>
                        <td>{u.fullname}</td>
                        <td>{u.email}</td>
                        <td className="warning">
                          <span>
                            {passwordVisibility[u._id] ? u.password : "*****"}
                          </span>
                          <button
                            onClick={() => togglePasswordVisibility(u._id)}
                            style={{
                              border: "none",
                              background: "none",
                              cursor: "pointer",
                            }}
                          >
                            {passwordVisibility[u._id] ? (
                              <AiFillEyeInvisible />
                            ) : (
                              <AiFillEye />
                            )}
                          </button>
                        </td>
                        <td className="primary">
                          <Button
                            onClick={() => handleEditUser(u)}
                            style={{
                              backgroundColor: "#f3b15a",
                              border: "none",
                            }}
                          >
                            แก้ไข
                          </Button>
                        </td>
                        <td>
                          <Button
                            onClick={() => handleDeleteUser(u._id)}
                            style={{
                              backgroundColor: "#f26665",
                              border: "none",
                            }}
                          >
                            ลบ
                          </Button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={6}>
                        <div style={{ margin: "20% 0", textAlign: "center" }}>
                          ไม่พบผู้ใช้ที่ค้นหา
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      <Modal
        show={showEditModal}
        onHide={handleModalClose}
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>แก้ไขบัญชีผู้ใช้</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group controlId="formFullname">
              <Form.Label>ชื่อ</Form.Label>
              <Form.Control
                type="text"
                value={fullname}
                onChange={(e) => setFullname(e.target.value)}
              />
            </Form.Group>

            <Form.Group controlId="formEmail">
              <Form.Label>อีเมล</Form.Label>
              <Form.Control
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleModalClose}>
            ปิด
          </Button>
          <Button
            style={{
              backgroundColor: "#7380ec",
              borderColor: "#7380ec",
              color: "white",
            }}
            onClick={handleUpdateUser}
          >
            บันทึกการเปลี่ยนแปลง
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Delete User Modal */}
      <DeleteAdminAccountModal
        userId={selectedUser}
        show={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onDeleteSuccess={handleDeleteSuccess}
      />
    </div>
  );
};

export default ManageUser;
