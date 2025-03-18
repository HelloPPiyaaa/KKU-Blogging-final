import React, { useEffect, useState } from "react";
import { IoMdAdd } from "react-icons/io";
import { Modal, Button } from "react-bootstrap";
import {
  addBadWordGroupAPI,
  deleteBadWordGroupAPI,
  fetchBadWordGroupsAPI,
  updateBadWordGroupAPI,
} from "../../api/badwordAPI";

const ManageBadwords: React.FC = () => {
  const [badwordGroups, setBadwordGroups] = useState<any[]>([]);
  const [filteredBadwordGroups, setFilteredBadwordGroups] = useState<any[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [badWords, setBadWords] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [groupToDelete, setGroupToDelete] = useState<string | null>(null);
  const [searchKeyword, setSearchKeyword] = useState("");
  const [langFilter, setLangFilter] = useState("");

  useEffect(() => {
    const loadBadwordGroups = async () => {
      try {
        const fetchedGroups = await fetchBadWordGroupsAPI();
        if (Array.isArray(fetchedGroups)) {
          setBadwordGroups(fetchedGroups);
          setFilteredBadwordGroups(fetchedGroups); // แสดงทั้งหมดในตอนเริ่มต้น
        } else {
          console.error("Fetched data is not an array");
        }
      } catch (error) {
        console.error("Failed to load bad word groups:", error);
      }
    };
    loadBadwordGroups();
  }, []);

  // ฟังก์ชันสำหรับการค้นหา
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const keyword = e.target.value;
    setSearchKeyword(keyword);

    if (keyword.trim() === "") {
      setFilteredBadwordGroups(badwordGroups); // ถ้าไม่มีการค้นหาให้แสดงทั้งหมด
    } else {
      const filtered = badwordGroups.filter((group) =>
        group.words.some((word: string) =>
          word.toLowerCase().includes(keyword.toLowerCase())
        )
      );
      setFilteredBadwordGroups(filtered);
    }
  };

  const handleAddBadWords = async (e: React.FormEvent) => {
    e.preventDefault();
    const wordsArray = badWords
      .split(",")
      .map((word) => word.trim())
      .filter((word) => word !== "");

    if (wordsArray.length === 0) {
      alert("กรุณากรอกคำหยาบอย่างน้อย 1 คำ");
      return;
    }

    // ตรวจสอบคำที่ซ้ำ
    const existingWords = badwordGroups.flatMap((group) => group.words);
    const duplicateWords = wordsArray.filter((word) =>
      existingWords.includes(word)
    );

    if (duplicateWords.length > 0) {
      alert(`คำหยาบเหล่านี้มีอยู่แล้ว: ${duplicateWords.join(", ")}`);
      return;
    }

    try {
      const newGroup = await addBadWordGroupAPI(wordsArray);
      setBadwordGroups((prev) => [...prev, newGroup]);
      setFilteredBadwordGroups((prev) => [...prev, newGroup]); // เพิ่มกลุ่มใหม่เข้าไปในผลลัพธ์ที่กรองแล้ว
      setBadWords("");
      setShowAddModal(false);
    } catch (error) {
      console.error("Error adding bad words:", error);
    }
  };

  const handleEditBadWords = (group: any) => {
    if (!group) return;
    setBadWords(group.words.join(", "));
    setEditingId(group._id);
    setShowEditModal(true);
  };

  const handleUpdateBadWords = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingId) return;

    const wordsArray = badWords
      .split(",")
      .map((word) => word.trim())
      .filter((word) => word !== "");

    if (wordsArray.length === 0) {
      alert("กรุณากรอกคำหยาบอย่างน้อย 1 คำ");
      return;
    }

    try {
      const updatedGroup = await updateBadWordGroupAPI(editingId, wordsArray);
      setBadwordGroups((prev) =>
        prev.map((group) => (group._id === editingId ? updatedGroup : group))
      );
      setFilteredBadwordGroups((prev) =>
        prev.map((group) => (group._id === editingId ? updatedGroup : group))
      );
      setBadWords("");
      setEditingId(null);
      setShowEditModal(false);
    } catch (error) {
      console.error("Error updating bad words:", error);
    }
  };

  const handleDeleteBadWords = async (id: string) => {
    try {
      await deleteBadWordGroupAPI(id);
      setBadwordGroups((prev) => prev.filter((group) => group._id !== id));
      setFilteredBadwordGroups((prev) =>
        prev.filter((group) => group._id !== id)
      ); // ลบจากผลลัพธ์ที่กรองแล้ว
    } catch (error) {
      console.error("Error deleting bad words:", error);
    }
  };

  const confirmDeleteBadWords = (id: string) => {
    setGroupToDelete(id);
    setShowConfirmModal(true);
  };

  return (
    <div className="manageUser">
      <div className="main1">
        <h1>จัดการคำหยาบ</h1>

        <div className="recent-order" style={{ marginTop: "1.5rem" }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <h2 style={{marginLeft:"2px"}}>รายการ</h2>

            {/* ปุ่ม filter และปุ่มเพิ่ม */}
            <div
              className="bw-filter-buttons"
              style={{
                display: "flex",
                gap: "10px",
                alignItems: "center",
              }}
            >
              <Button
                variant={langFilter === "" ? "primary" : "outline-primary"}
                onClick={() => {
                  setFilteredBadwordGroups(badwordGroups);
                  setLangFilter("");
                  setSearchKeyword("");
                }}
                style={{
                  backgroundColor: langFilter === "" ? "#363949" : "white",
                  color: langFilter === "" ? "white" : "#363949",
                  padding: "5px 10px",
                  borderRadius: "5px",
                  fontSize: "14px",
                  border: langFilter === "" ? "none" : "1px solid #363949",
                }}
              >
                ทั้งหมด
              </Button>
              <Button
                variant={langFilter === "TH" ? "primary" : "outline-primary"}
                onClick={() => {
                  setFilteredBadwordGroups(
                    badwordGroups.filter((group) =>
                      group.words.some((word: string) => /[ก-๙]/.test(word))
                    )
                  );
                  setLangFilter("TH");
                  setSearchKeyword("");
                }}
                style={{
                  backgroundColor: langFilter === "TH" ? "#363949" : "white",
                  color: langFilter === "TH" ? "white" : "#363949",
                  padding: "5px 10px",
                  borderRadius: "5px",
                  fontSize: "14px",
                  border: langFilter === "TH" ? "none" : "1px solid #363949",
                }}
              >
                TH
              </Button>
              <Button
                variant={langFilter === "EN" ? "primary" : "outline-primary"}
                onClick={() => {
                  setFilteredBadwordGroups(
                    badwordGroups.filter((group) =>
                      group.words.some((word: string) => /[a-zA-Z]/.test(word))
                    )
                  );
                  setLangFilter("EN");
                  setSearchKeyword("");
                }}
                style={{
                  backgroundColor: langFilter === "EN" ? "#363949" : "white",
                  color: langFilter === "EN" ? "white" : "#363949",
                  padding: "5px 10px",
                  borderRadius: "5px",
                  fontSize: "14px",
                  border: langFilter === "EN" ? "none" : "1px solid #363949",
                }}
              >
                EN
              </Button>

              <div
                className="add-q add-badwords"
                onClick={() => setShowAddModal(true)}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  cursor: "pointer",
                  backgroundColor: "#363949",
                  color: "#fff",
                  padding: "5px 10px",
                  borderRadius: "5px",
                  fontSize: "14px",
                }}
              >
                <IoMdAdd />
                <span style={{ marginLeft: "5px" }}>เพิ่มรายการคำหยาบ</span>
              </div>
            </div>
          </div>

          {/* ช่องค้นหา */}
          {langFilter == "" ? (
            <div className="search-bar-badwords">
              <input
                type="text"
                placeholder="ค้นหาคำหยาบ..."
                value={searchKeyword}
                onChange={handleSearch}
                className="form-control"
                style={{
                  width: "100%",
                  padding: "10px 15px",
                  marginTop: "0px",
                  fontSize: "16px",
                  border: "none",
                  borderRadius: "10px",
                  backgroundColor: "white",
                }}
              />
            </div>
          ) : null}

          <div className="right">
            <div
              className="activity-analytics"
              style={{
                marginTop: "0px",
                height: "450px", // ความสูง 400px
                overflowY: "auto", // แสดงแถบเลื่อน
                padding: "0.5%",
              }}
            >
              {filteredBadwordGroups.length === 0 ? (
                <p
                  style={{
                    textAlign: "center",
                    fontSize: "18px",
                    color: "#888",
                  }}
                >
                  ไม่พบคำหยาบที่ค้นหา
                </p>
              ) : (
                filteredBadwordGroups.map((group) => (
                  <div className="item" key={group._id}>
                    <div className="right">
                      <div className="info">
                        <h3>{group.words.join(", ")}</h3>
                      </div>
                      <div className="manage d-flex">
                        <div
                          className="edit warning"
                          onClick={() => handleEditBadWords(group)}
                          style={{ paddingRight: "10px" }}
                        >
                          <h3>แก้ไข</h3>
                        </div>
                        <div
                          className="delete danger"
                          onClick={() => confirmDeleteBadWords(group._id)}
                        >
                          <h3>ลบ</h3>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Modal สำหรับเพิ่มคำหยาบ */}
      <Modal show={showAddModal} onHide={() => setShowAddModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>เพิ่มรายการคำหยาบ</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <textarea
            placeholder="คำหยาบ1, คำหยาบ2,... "
            value={badWords}
            onChange={(e) => setBadWords(e.target.value)}
            className="form-control"
          />
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowAddModal(false)}>
            ยกเลิก
          </Button>
          <Button
            style={{
              backgroundColor: "#7380ec",
              borderColor: "#7380ec",
              color: "white",
            }}
            onClick={handleAddBadWords}
          >
            บันทึก
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Modal สำหรับแก้ไขคำหยาบ */}
      <Modal
        show={showEditModal}
        onHide={() => setShowEditModal(false)}
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>แก้ไขรายการคำหยาบ</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <textarea
            placeholder="คำหยาบ1,คำหยาบ2,..."
            value={badWords}
            onChange={(e) => setBadWords(e.target.value)}
            className="form-control"
          />
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowEditModal(false)}>
            ยกเลิก
          </Button>
          <Button
            style={{
              backgroundColor: "#7380ec",
              borderColor: "#7380ec",
              color: "white",
            }}
            onClick={handleUpdateBadWords}
          >
            บันทึก
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Modal สำหรับยืนยันการลบ */}
      <Modal
        show={showConfirmModal}
        onHide={() => setShowConfirmModal(false)}
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>ยืนยันการลบ</Modal.Title>
        </Modal.Header>
        <Modal.Body>คุณแน่ใจว่าต้องการลบรายการคำหยาบนี้หรือไม่?</Modal.Body>
        <Modal.Footer>
          <Button
            variant="secondary"
            onClick={() => setShowConfirmModal(false)}
          >
            ยกเลิก
          </Button>
          <Button
            variant="danger"
            onClick={() => {
              if (groupToDelete) {
                handleDeleteBadWords(groupToDelete);
                setShowConfirmModal(false);
              }
            }}
          >
            ลบ
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default ManageBadwords;
