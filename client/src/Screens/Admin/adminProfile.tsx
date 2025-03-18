import "../../misc/adminProfile.css";
import { useParams } from "react-router-dom";
import React, { useState, useEffect } from "react";
import backArrow from "../../pic/go-back.png";
import { RxHamburgerMenu } from "react-icons/rx";
import { MdLightMode, MdDarkMode } from "react-icons/md";
import Pro from "../../pic/AdminIcon.png";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import toast, { Toaster } from "react-hot-toast";
import InputBox from "../../components/input.component";

export interface Report {
  _id: string;
  reason: string;
  verified: boolean;
  status: string;
  createdAt: string;
  reportedBy: {
    _id: string;
    fullname: string;
  };
  post: {
    _id: string;
    author: {
      _id: string;
      fullname: string;
      banner: string;
      profile_picture: string;
    };
    content: [
      {
        time: number;
        blocks: [
          {
            id: string;
            type: string;
            data: {
              text: string;
            };
          }
        ];
        version: string;
      }
    ];
    image: string;
    topic: string;
    detail: string;
    tags: string[];
    banner: string;
    publishedAt: string;
    contentWithImages: {
      content: string;
      images?: string[];
    }[];
  };
}

interface AdminData {
  firstname: string;
  lastname: string;
  email: string;
  tel: string;
  username: string; // เพิ่ม username
}

interface PasswordFormData {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

interface LoginLog {
  _id: string;
  adminId: {
    username: string;
    email: string;
  };
  loginTime: string;
}

interface AdminListData {
  _id: string;
  username: string;
  email: string;
  firstname: string;
  lastname: string;
  tel: string;
}

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
}

interface EditAdminModalProps {
  isOpen: boolean;
  onClose: () => void;
  admin: AdminListData;
  onSave: (updatedData: AdminListData) => void;
}

interface AddAdminModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (
    adminData: Omit<AdminListData, "_id"> & { password: string }
  ) => void;
}

const AdminProfile: React.FC = () => {
  const { adminId } = useParams<{ adminId: string }>();
  const API_BASE_URL = process.env.REACT_APP_API_ENDPOINT;
  const adminUsername = sessionStorage.getItem("userId");
  const [adminProfile, setAdminProfile] = useState<any>(true);
  const [selectedCate, setSelectedCate] = useState<string>("admin-profile"); // เพิ่มเติม: สร้าง selectedCate สำหรับเปลี่ยน cate ของหน้าเว็บ เปลี่ยนให้ defualt เป็น admin-profile
  const [showModal, setShowModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [title, setTitle] = useState("admin-profile"); // เพิ่มเติม: สร้าง state สำหรับเปลี่ยน title ของหน้าเว็บ เปลี่ยนให้ defualt เป็น profile
  const [activeTab, setActiveTab] = useState("login-history");
  const [adminData, setAdminData] = useState<AdminData>({
    firstname: "",
    lastname: "",
    email: "",
    tel: "",
    username: "", // เพิ่ม username field
  });
  const [isEditing, setIsEditing] = useState(false);
  const [passwordData, setPasswordData] = useState<PasswordFormData>({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [loginLogs, setLoginLogs] = useState<LoginLog[]>([]);
  const [admins, setAdmins] = useState<AdminListData[]>([]);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [adminToDelete, setAdminToDelete] = useState<string>("");
  const [showEditConfirm, setShowEditConfirm] = useState(false);
  const [adminToEdit, setAdminToEdit] = useState<string>("");
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedAdmin, setSelectedAdmin] = useState<AdminListData | null>(
    null
  );
  const [showAddModal, setShowAddModal] = useState(false);

  const handleShowModal = (report: any) => {
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
  };

  const handleTabClick = (tab: string) => {
    setActiveTab(tab);
  };

  const navigate = useNavigate();

  const resetPasswordModal = () => {
    setShowPasswordModal(true);
  };

  useEffect(() => {
    const user = JSON.parse(sessionStorage.getItem("user") || "{}");
    const accessToken = user?.access_token;

    if (!accessToken) {
      navigate("/admin/login");
      return;
    }

    const fetchData = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/login/auth`, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });

        console.log("Authentication successful:", response.data);
      } catch (error) {
        sessionStorage.clear();
        console.error(error);
        navigate("/admin/login");
      }
    };

    fetchData();
  }, [navigate, API_BASE_URL]);

  useEffect(() => {
    const themToggler = document.querySelector(".theme-toggler");

    if (themToggler) {
      const changeTheme = () => {
        document.body.classList.toggle("dark-theme-variables");

        themToggler
          ?.querySelector("svg:nth-child(1)")
          ?.classList.toggle("active");
        themToggler
          ?.querySelector("svg:nth-child(2)")
          ?.classList.toggle("active");
      };

      themToggler.addEventListener("click", changeTheme);

      return () => {
        themToggler.removeEventListener("click", changeTheme);
      };
    }
  }, [selectedCate]);

  // เพิ่มเติม: เมื่อเลือกหมวดหมู่ต่างๆ ค่า selectedCate จะเปลี่ยน และ title ของหน้าเว็บจะเปลี่ยนตามทันที
  useEffect(() => {
    if (selectedCate === "dashboard") {
      setTitle("Dashboard");
    } else if (selectedCate === "average") {
      setTitle("จัดการบล็อก");
    } else if (selectedCate === "manage-q") {
      setTitle("จัดการคำถาม");
    } else if (selectedCate === "manage-user") {
      setTitle("จัดการบัญชีผู้ใช้");
    } else if (selectedCate === "manage-cate") {
      setTitle("จัดการหมวดหมู่");
    } else if (selectedCate === "manage-badwords") {
      setTitle("จัดการคำหยาบ");
    } else if (selectedCate === "admin-profile") {
      setTitle("Admin");
    }
  }, [selectedCate]);

  useEffect(() => {
    const fetchAdminData = async () => {
      try {
        const user = JSON.parse(sessionStorage.getItem("user") || "{}");
        const response = await axios.get(`${API_BASE_URL}/admin/${adminId}`, {
          headers: {
            Authorization: `Bearer ${user.access_token}`,
          },
        });
        setAdminData(response.data);
      } catch (error) {
        console.error("Error fetching admin data:", error);
      }
    };
    fetchAdminData();
  }, [adminId, API_BASE_URL]);

  useEffect(() => {
    const fetchLoginHistory = async () => {
      try {
        const user = JSON.parse(sessionStorage.getItem("user") || "{}");
        const response = await axios.get(
          `${API_BASE_URL}/admin/get-login-history`,
          {
            headers: {
              Authorization: `Bearer ${user.access_token}`,
            },
          }
        );
        setLoginLogs(response.data);
      } catch (error) {
        console.error("Error fetching login history:", error);
        toast.error("ไม่สามารถดึงข้อมูลประวัติการเข้าสู่ระบบได้");
      }
    };

    if (activeTab === "login-history") {
      fetchLoginHistory();
    }
  }, [activeTab, API_BASE_URL]);

  const fetchAdmins = async () => {
    try {
      const user = JSON.parse(sessionStorage.getItem("user") || "{}");
      const response = await axios.get(`${API_BASE_URL}/admin/all-admins`, {
        headers: {
          Authorization: `Bearer ${user.access_token}`,
        },
      });
      setAdmins(response.data);
    } catch (error) {
      console.error("Error fetching admins:", error);
      toast.error("ไม่สามารถดึงข้อมูลแอดมินได้");
    }
  };

  useEffect(() => {
    if (activeTab === "edit-admin-profile") {
      fetchAdmins();
    }
  }, [activeTab]);

  const handleDeleteAdmin = async (adminId: string) => {
    try {
      const user = JSON.parse(sessionStorage.getItem("user") || "{}");
      await axios.delete(`${API_BASE_URL}/admin/users/${adminId}`, {
        headers: {
          Authorization: `Bearer ${user.access_token}`,
        },
      });
      toast.success("ลบแอดมินสำเร็จ");
      fetchAdmins();
    } catch (error) {
      toast.error("ไม่สามารถลบแอดมินได้");
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setAdminData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleUpdate = async () => {
    try {
      const user = JSON.parse(sessionStorage.getItem("user") || "{}");
      const token = user.access_token;

      if (!token) {
        throw new Error("No authentication token found");
      }

      const response = await axios.put(
        `${API_BASE_URL}/admin/users/${adminId}`,
        adminData,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.status === 200) {
        setIsEditing(false);
        toast.success("แก้ไขข้อมูลสำเร็จ");
      }
    } catch (error: any) {
      console.error("Error updating admin data:", error);
      toast.error(
        error.response?.data?.message || "เกิดข้อผิดพลาดในการแก้ไขข้อมูล"
      );
    }
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPasswordData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handlePasswordSubmit = async () => {
    try {
      if (passwordData.newPassword !== passwordData.confirmPassword) {
        toast.error("รหัสผ่านใหม่และยืนยันรหัสผ่านไม่ตรงกัน");
        return;
      }

      const user = JSON.parse(sessionStorage.getItem("user") || "{}");
      const response = await axios.put(
        `${API_BASE_URL}/admin/change-password/${adminId}`,
        {
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword,
        },
        {
          headers: {
            Authorization: `Bearer ${user.access_token}`,
          },
        }
      );

      if (response.status === 200) {
        toast.success("เปลี่ยนรหัสผ่านสำเร็จ");
        setShowPasswordModal(false);
        setPasswordData({
          currentPassword: "",
          newPassword: "",
          confirmPassword: "",
        });
      }
    } catch (error: any) {
      toast.error(
        error.response?.data?.message || "เกิดข้อผิดพลาดในการเปลี่ยนรหัสผ่าน"
      );
    }
  };

  const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
    isOpen,
    onClose,
    onConfirm,
    title,
    message,
  }) => {
    if (!isOpen) return null;

    return (
      <div className="admin-acp confirmation-modal">
        <div className="modal-content">
          <h2>{title}</h2>
          <p>{message}</p>
          <div className="modal-actions">
            <button className="cancel-btn" onClick={onClose}>
              ยกเลิก
            </button>
            <button className="confirm-btn" onClick={onConfirm}>
              ยืนยัน
            </button>
          </div>
        </div>
      </div>
    );
  };

  const EditAdminModal: React.FC<EditAdminModalProps> = ({
    isOpen,
    onClose,
    admin,
    onSave,
  }) => {
    const [editData, setEditData] = useState({ ...admin });

    if (!isOpen) return null;

    return (
      <div className="admin-acp confirmation-modal">
        <div className="modal-content">
          <h2>แก้ไขข้อมูลแอดมิน</h2>
          <div className="edit-form">
            <div className="input-group">
              <label>ชื่อผู้ใช้</label>
              <input
                type="text"
                value={editData.username}
                onChange={(e) =>
                  setEditData({ ...editData, username: e.target.value })
                }
                className="form-input"
              />
            </div>
            <div className="input-group">
              <label>อีเมล</label>
              <input
                type="email"
                value={editData.email}
                onChange={(e) =>
                  setEditData({ ...editData, email: e.target.value })
                }
              />
            </div>
            <div className="input-group">
              <label>ชื่อ</label>
              <input
                type="text"
                value={editData.firstname}
                onChange={(e) =>
                  setEditData({ ...editData, firstname: e.target.value })
                }
              />
            </div>
            <div className="input-group">
              <label>นามสกุล</label>
              <input
                type="text"
                value={editData.lastname}
                onChange={(e) =>
                  setEditData({ ...editData, lastname: e.target.value })
                }
              />
            </div>
            <div className="input-group">
              <label>เบอร์โทร</label>
              <input
                type="tel"
                value={editData.tel}
                onChange={(e) =>
                  setEditData({ ...editData, tel: e.target.value })
                }
              />
            </div>
          </div>
          <div className="modal-actions">
            <button className="cancel-btn" onClick={onClose}>
              ยกเลิก
            </button>
            <button
              className="confirm-btn"
              onClick={() => {
                onSave(editData);
                onClose();
              }}
            >
              บันทึก
            </button>
          </div>
        </div>
      </div>
    );
  };

  const AddAdminModal: React.FC<AddAdminModalProps> = ({
    isOpen,
    onClose,
    onSave,
  }) => {
    const [newAdmin, setNewAdmin] = useState({
      username: "",
      email: "",
      firstname: "",
      lastname: "",
      tel: "",
      password: "",
    });

    if (!isOpen) return null;

    return (
      <div className="admin-acp confirmation-modal">
        <div className="modal-content">
          <h2>เพิ่มแอดมิน</h2>
          <div className="edit-form">
            <div className="input-group">
              <label>ชื่อผู้ใช้</label>
              <input
                type="text"
                value={newAdmin.username}
                onChange={(e) =>
                  setNewAdmin({ ...newAdmin, username: e.target.value })
                }
                className="form-input"
              />
            </div>
            <div className="input-group">
              <label>รหัสผ่าน</label>
              <input
                type="password"
                value={newAdmin.password}
                onChange={(e) =>
                  setNewAdmin({ ...newAdmin, password: e.target.value })
                }
                className="form-input"
              />
            </div>
            <div className="input-group">
              <label>อีเมล</label>
              <input
                type="email"
                value={newAdmin.email}
                onChange={(e) =>
                  setNewAdmin({ ...newAdmin, email: e.target.value })
                }
              />
            </div>
            <div className="input-group">
              <label>ชื่อ</label>
              <input
                type="text"
                value={newAdmin.firstname}
                onChange={(e) =>
                  setNewAdmin({ ...newAdmin, firstname: e.target.value })
                }
              />
            </div>
            <div className="input-group">
              <label>นามสกุล</label>
              <input
                type="text"
                value={newAdmin.lastname}
                onChange={(e) =>
                  setNewAdmin({ ...newAdmin, lastname: e.target.value })
                }
              />
            </div>
            <div className="input-group">
              <label>เบอร์โทร</label>
              <input
                type="tel"
                value={newAdmin.tel}
                onChange={(e) =>
                  setNewAdmin({ ...newAdmin, tel: e.target.value })
                }
              />
            </div>
          </div>
          <div className="modal-actions">
            <button className="cancel-btn" onClick={onClose}>
              ยกเลิก
            </button>
            <button
              className="confirm-btn"
              onClick={() => {
                onSave(newAdmin);
                onClose();
              }}
            >
              บันทึก
            </button>
          </div>
        </div>
      </div>
    );
  };

  const handleEditClick = (admin: AdminListData) => {
    setSelectedAdmin(admin);
    setShowEditModal(true);
  };

  const handleDeleteClick = (adminId: string) => {
    setAdminToDelete(adminId);
    setShowDeleteConfirm(true);
  };

  const handleSaveEdit = async (updatedData: AdminListData) => {
    try {
      const user = JSON.parse(sessionStorage.getItem("user") || "{}");
      await axios.put(
        `${API_BASE_URL}/admin/users/${updatedData._id}`,
        updatedData,
        {
          headers: {
            Authorization: `Bearer ${user.access_token}`,
          },
        }
      );
      toast.success("แก้ไขข้อมูลสำเร็จ");
      fetchAdmins();
    } catch (error) {
      toast.error("ไม่สามารถแก้ไขข้อมูลได้");
    }
  };

  const handleAddAdmin = async (
    adminData: Omit<AdminListData, "_id"> & { password: string }
  ) => {
    try {
      const user = JSON.parse(sessionStorage.getItem("user") || "{}");
      await axios.post(`${API_BASE_URL}/admin/register`, adminData, {
        headers: {
          Authorization: `Bearer ${user.access_token}`,
        },
      });
      toast.success("เพิ่มแอดมินสำเร็จ");
      fetchAdmins();
    } catch (error) {
      toast.error("ไม่สามารถเพิ่มแอดมินได้");
    }
  };

  const addAdmin = () => {
    setShowAddModal(true);
  };

  return (
    <div className="adminProfile adminHome">
      <Toaster position="top-center" />
      <div className="admin-dashboard-container">
        <div className="main-content">
          <div className="header">
            <div className="header-content">
              <div className="admin-profile-header">
                <div
                  className="back-arrow"
                  onClick={() => {
                    navigate(-1); // เพิ่มเติม:เมื่อคลิก back-arrow จะกลับไปหน้าก่อนหน้า
                  }}
                >
                  <img src={backArrow} alt="" />
                </div>
                {/* เพิ่มเติม: title ให้เป็น Dynamic */}
                <h1>{title}</h1>
              </div>
              {/* เพิ่มเติม: profile-theme เป็นส่วนของ profile เเละ theme */}
              <div className="profile-theme">
                <div className="right">
                  <div className="top">
                    <div
                      className="back-arrow-phone"
                      onClick={() => {
                        navigate(-1); // เพิ่มเติม:เมื่อคลิก back-arrow จะกลับไปหน้าก่อนหน้า
                      }}
                    >
                      <img src={backArrow} alt="" />
                    </div>
                    {/* <div className="theme-toggler">
                                            <MdLightMode className="active" />
                                            <MdDarkMode />
                                        </div> */}

                    {adminProfile && (
                      <div
                        className="profile"
                        onClick={() => {
                          setSelectedCate("admin-profile");
                          navigate(`/admin/${adminId}/profile`); // เพิ่มเติม:เมื่อคลิก profile จะไปหน้า profile
                        }}
                      >
                        <div className="info">
                          <p style={{ fontSize: "14px", marginTop: "10px" }}>
                            Hello, <b>{adminUsername}</b>
                          </p>
                        </div>
                        <div className="profile-photo">
                          <img src={Pro} alt="Profile" />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* เพิ่มเติม: ส่วนของตารางข้อมูล */}
          <div className="content-area">
            <div className="user-profile-section">
              {/* เพิ่มเติม: ส่วนการกรอก from  */}
              <div className="profile-form">
                <div className="form-fields">
                  <div className="input-group-profile">
                    <label>Firstname</label>
                    <input
                      type="text"
                      name="firstname"
                      placeholder="Firstname"
                      className="form-input"
                      value={adminData.firstname}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                    />
                    <label>Lastname</label>
                    <input
                      type="text"
                      name="lastname"
                      placeholder="Lastname"
                      className="form-input"
                      value={adminData.lastname}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                    />
                    <label>Email</label>
                    <input
                      type="email"
                      name="email"
                      placeholder="Email"
                      className="form-input"
                      value={adminData.email}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                    />
                    <label>Tel</label>
                    <input
                      type="tel"
                      name="tel"
                      placeholder="Tell"
                      className="form-input"
                      value={adminData.tel}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                    />
                  </div>
                  <div className="action-buttons">
                    {isEditing ? (
                      <>
                        <button className="edit-btn" onClick={handleUpdate}>
                          บันทึก
                        </button>
                        <button
                          className="cancel-btn"
                          onClick={() => setIsEditing(false)}
                        >
                          ยกเลิก
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          className="edit-btn"
                          onClick={() => setIsEditing(true)}
                        >
                          แก้ไข
                        </button>
                        <button
                          className="change-password-btn"
                          onClick={() => {
                            resetPasswordModal();
                          }}
                        >
                          เปลี่ยนรหัสผ่าน
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
              {/* เพิ่มเติม: ส่วนของ tab เลือกว่าจะดูข้อมมูลไหน มี  login history  เเละ   admin profile  */}
              <div className="profile-tabs">
                <div className="tabs">
                  <button
                    className={`tab-btn ${
                      activeTab === "login-history" ? "active" : ""
                    }`}
                    onClick={() => handleTabClick("login-history")}
                  >
                    ประวัติการเข้าสู่ระบบ
                  </button>
                  <button
                    className={`tab-btn ${
                      activeTab === "edit-admin-profile" ? "active" : ""
                    }`}
                    onClick={() => handleTabClick("edit-admin-profile")}
                  >
                    แอดมินทั้งหมด
                  </button>
                </div>
                {/* ตาราง login history */}
                {activeTab === "login-history" && (
                  <div
                    className="tab-content"
                    style={{
                      display: "inline-block",
                      width: "100%", // หรือกำหนดความกว้างตามต้องการ
                      maxHeight: "450px", // กำหนดความสูงสูงสุด
                      overflowY: "auto", // ทำให้เลื่อนเฉพาะแนวตั้ง
                      overflowX: "auto", // ถ้าต้องการให้เลื่อนแนวนอนด้วย
                      border: "1px solid #ddd", // เพิ่มเส้นขอบให้ดูชัดขึ้น (เลือกใช้)
                    }}
                  >
                    <table
                      style={{ width: "100%", borderCollapse: "collapse" }}
                    >
                      <thead
                        style={{
                          position: "sticky",
                          top: "0",
                          background: "#fff",
                          zIndex: 1,
                        }}
                      >
                        <tr>
                          <th>วันที่</th>
                          <th>ชื่อบัญชีผู้ใช้</th>
                          <th>อีเมล</th>
                          <th>เวลาที่เข้าสู่ระบบ</th>
                        </tr>
                      </thead>
                      <tbody>
                        {loginLogs.map((log) => (
                          <tr key={log._id}>
                            <td>
                              {new Date(log.loginTime).toLocaleDateString(
                                "th-TH"
                              )}
                            </td>
                            <td>{log.adminId.username}</td>
                            <td>{log.adminId.email}</td>
                            <td>
                              {new Date(log.loginTime).toLocaleTimeString(
                                "th-TH"
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
                {/* ตาราง แก้ไข admin profile */}
                {activeTab === "edit-admin-profile" && (
                  <div
                    className="tab-content"
                    style={{
                      display: "inline-block",
                      width: "100%", // หรือกำหนดความกว้างตามต้องการ
                      maxHeight: "450px", // กำหนดความสูงสูงสุด
                      overflowY: "auto", // ทำให้เลื่อนเฉพาะแนวตั้ง
                      overflowX: "auto", // ถ้าต้องการให้เลื่อนแนวนอนด้วย
                      border: "1px solid #ddd", // เพิ่มเส้นขอบให้ดูชัดขึ้น (เลือกใช้)
                    }}
                  >
                    <table
                      style={{ width: "100%", borderCollapse: "collapse" }}
                    >
                      <thead
                        style={{
                          position: "sticky",
                          top: "0",
                          background: "#fff", // ให้ background เพื่อไม่ให้โปร่งใส
                          zIndex: 1, // ทำให้ thead อยู่ด้านบนสุด
                        }}
                      >
                        <tr>
                          <th>ชื่อผู้ใช้</th>
                          <th>อีเมล</th>
                          <th>ชื่อ</th>
                          <th>นามสกุล</th>
                          <th>เบอร์โทร</th>
                          <th>
                            {adminData?.email ===
                              "kkubloggingplatform@gmail.com" && (
                              <button
                                onClick={addAdmin}
                                className="btn btn-primary"
                              >
                                เพิ่มแอดมิน
                              </button>
                            )}
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {admins.map((admin) => (
                          <tr key={admin._id}>
                            <td>{admin.username}</td>
                            <td>{admin.email}</td>
                            <td>{admin.firstname}</td>
                            <td>{admin.lastname}</td>
                            <td>{admin.tel}</td>
                            <td>
                              <div className="action-buttons-cell">
                                {adminData?.email ===
                                  "kkubloggingplatform@gmail.com" && (
                                  <>
                                    <button
                                      className="edit-btn"
                                      onClick={() => handleEditClick(admin)}
                                    >
                                      แก้ไข
                                    </button>
                                    <button
                                      className="delete-btn"
                                      onClick={() =>
                                        handleDeleteClick(admin._id)
                                      }
                                    >
                                      ลบ
                                    </button>
                                  </>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {showPasswordModal && (
        <div className="admin-acp password-modal">
          <div className="modal-content">
            <form
              className="m-3"
              onSubmit={(e) => {
                e.preventDefault();
                handlePasswordSubmit();
              }}
            >
              <div className="modal-header">
                <h1 className="topic-ChangePass fs-5">เปลี่ยนรหัสผ่าน</h1>
                <button
                  type="button"
                  onClick={() => setShowPasswordModal(false)}
                >
                  &times;
                </button>
              </div>

              <div className="inputChangpassword">
                <div className="input-group">
                  <InputBox
                    type="password"
                    name="currentPassword"
                    className="profile-edit-input"
                    placeholder="รหัสผ่านปัจจุบัน"
                    value={passwordData.currentPassword}
                    onChange={handlePasswordChange}
                  />
                </div>

                <div className="input-group">
                  <InputBox
                    type="password"
                    name="newPassword"
                    className="profile-edit-input"
                    placeholder="รหัสผ่านใหม่"
                    value={passwordData.newPassword}
                    onChange={handlePasswordChange}
                  />
                </div>

                <div className="input-group">
                  <InputBox
                    type="password"
                    name="confirmPassword"
                    className="profile-edit-input"
                    placeholder="ยืนยันรหัสผ่านใหม่"
                    value={passwordData.confirmPassword}
                    onChange={handlePasswordChange}
                  />
                </div>
                <button className="btn-dark px-5" type="submit">
                  เปลี่ยนรหัสผ่าน
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <ConfirmationModal
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={() => {
          handleDeleteAdmin(adminToDelete);
          setShowDeleteConfirm(false);
        }}
        title="ยืนยันการลบแอดมิน"
        message="คุณแน่ใจหรือไม่ที่จะลบแอดมินคนนี้?"
      />

      <ConfirmationModal
        isOpen={showEditConfirm}
        onClose={() => setShowEditConfirm(false)}
        onConfirm={() => {
          navigate(`/admin/edit/${adminToEdit}`);
          setShowEditConfirm(false);
        }}
        title="ยืนยันการแก้ไขแอดมิน"
        message="คุณต้องการแก้ไขข้อมูลแอดมินคนนี้ใช่หรือไม่?"
      />

      {selectedAdmin && (
        <EditAdminModal
          isOpen={showEditModal}
          onClose={() => setShowEditModal(false)}
          admin={selectedAdmin}
          onSave={handleSaveEdit}
        />
      )}

      <AddAdminModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSave={handleAddAdmin}
      />
    </div>
  );
};

export default AdminProfile;
