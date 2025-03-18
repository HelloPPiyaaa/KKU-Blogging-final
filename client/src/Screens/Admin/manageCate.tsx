import React, { useMemo, useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { MdCategory } from "react-icons/md";
import { Modal, Button } from "react-bootstrap";
import { fetchAllUser } from "../../api/adminProfile";

interface Blog {
  _id: string;
  blog_id: string;
  topic: string;
  banner: string;
  des: string;
  content: Array<{
    time: number;
    blocks: Array<{
      id: string;
      type: string;
      data: {
        text: string;
      };
    }>;
    version: string;
  }>;
  tags: string[];
  author: string;
  comments: any[];
  draft: boolean;
  likes: any[];
  saves: any[];
  views: number;
  publishedAt: string;
  updatedAt: string;
  __v: number;
}

const ManageCate: React.FC<{ blogsData: Blog[] }> = ({ blogsData }) => {
  const { id } = useParams<{ id: string }>();
  const [uniqueTags, setUniqueTags] = useState<any>([]);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedTag, setSelectedTag] = useState<{
    tags: string;
    banner: string;
  } | null>(null);
  const [newTag, setNewTag] = useState("");
  const [getBlog, setGetBlog] = useState<Blog[]>();
  const [searchKeyword, setSearchKeyword] = useState("");

  useEffect(() => {
    const tagCountMap: { [tag: string]: { count: number; banner: string } } = {};

    // กำหนดให้ blogs เป็น array ว่างถ้า getBlog หรือ blogsData ยังไม่มีค่า
    const blogs = getBlog || blogsData || [];
    blogs.forEach((blog) => {
      const { tags, banner } = blog;
      tags.forEach((tag) => {
        if (tagCountMap[tag]) {
          tagCountMap[tag].count += 1;
        } else {
          tagCountMap[tag] = { count: 1, banner };
        }
      });
    });

    const formattedTags = Object.entries(tagCountMap).map(([tag, { count, banner }]) => ({
      tags: tag,
      count,
      banner
    }));

    setUniqueTags(formattedTags);
  }, [blogsData, getBlog]);

  // คำนวณรายการที่ค้นหา (filtered) โดยใช้ searchKeyword
  const filteredTags = useMemo(() => {
    return uniqueTags.filter((tag: any) =>
      tag.tags.toLowerCase().includes(searchKeyword.toLowerCase())
    );
  }, [uniqueTags, searchKeyword]);

  const handleEditTag = async () => {
    if (selectedTag) {
      try {
        const response = await fetch(`${process.env.REACT_APP_API_ENDPOINT}/create-blog/edit-tag`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            old_tag: selectedTag.tags,
            new_tag: newTag
          })
        });

        if (!response.ok) throw new Error("Failed to edit tag");
        setShowEditModal(false);
        const allPosts = await fetchAllUser();
        setGetBlog(allPosts);
      } catch (error) {
        console.error("Error editing tag:", error);
      }
    }
  };

  const handleDeleteTag = async () => {
    if (selectedTag) {
      try {
        const response = await fetch(
          `${process.env.REACT_APP_API_ENDPOINT}/create-blog/deletetag`,
          {
            method: "DELETE",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ tag: selectedTag.tags })
          }
        );

        if (!response.ok) throw new Error("Failed to delete tag");
        setShowDeleteModal(false);
        const allPosts = await fetchAllUser();
        setGetBlog(allPosts);
      } catch (error: any) {
        console.error("Error deleting tag:", error.message);
      }
    }
  };

  return (
    <div className="manageUser">
      <div className="main1">
      <h2  style={{
                    fontSize: "1.8rem",
                    fontWeight: "800",
                    marginTop: "2rem"
                  }}>จัดการหมวดหมู่</h2>
        <div className="insights">
          <div className="user-all">
            <MdCategory className="svg1" />
            <div className="middle">
              <div className="left">
                <h3>หมวดหมู่ทั้งหมด</h3>
                {/* แสดงผลจำนวนหมวดหมู่ทั้งหมด (ไม่เปลี่ยนตามผลการค้นหา) */}
                <h1>{uniqueTags.length}</h1>
              </div>
            </div>
          </div>
        </div>

        <div className="recent-order" style={{ marginTop: "1.5rem" }}>
          <h2>รายการหมวดหมู่</h2>

          <div className="right">
            {/* ช่องค้นหา */}
            {/* เพิ่มเติม: เเก้ Css search-cate , input */}
            <div className="search-cate">
              <input
                type="text"
                placeholder="ค้นหาหมวดหมู่..."
                value={searchKeyword}
                onChange={(e) => setSearchKeyword(e.target.value)}
                style={{
                  width: "96%",
                  margin: "3px 3px",
                  padding: "10px 15px",
                  fontSize: "16px",
                  border: "none",
                  borderRadius: "10px",
                  backgroundColor: "white"
                }}
              />
            </div>
            <div
              className="activity-analytics"
              style={{
                marginTop: "0.5rem",
                overflowY: "scroll",
                maxHeight: "300px"
              }}
            >
              {filteredTags.map(({ tags, count, banner }: any) => (
                <div className="item" key={tags} style={{ margin: "20px 10px" }}>
                  <div className="right">
                    <div className="info">
                      <h3>
                        {tags} ({count} บล็อก)
                      </h3>
                    </div>
                    <div className="manage d-flex">
                      <div
                        className="edit warning"
                        style={{ paddingRight: "10px" }}
                        onClick={() => {
                          setSelectedTag({ tags, banner });
                          setNewTag(tags);
                          setShowEditModal(true);
                        }}
                      >
                        <h3>แก้ไข</h3>
                      </div>
                      <div
                        className="delete danger"
                        onClick={() => {
                          setSelectedTag({ tags, banner });
                          setShowDeleteModal(true);
                        }}
                      >
                        <h3>ลบ</h3>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              {filteredTags.length === 0 && (
                <p style={{ textAlign: "center", marginTop: "20px" }}>ไม่พบหมวดหมู่ที่ค้นหา</p>
              )}
            </div>
          </div>
        </div>

        {/* Modal สำหรับแก้ไข */}
        <Modal show={showEditModal} onHide={() => setShowEditModal(false)} centered>
          <Modal.Header closeButton>
            <Modal.Title>แก้ไขหมวดหมู่</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <input
              type="text"
              value={newTag}
              onChange={(e) => setNewTag(e.target.value)}
              placeholder="กรอกชื่อหมวดหมู่ใหม่"
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
                color: "white"
              }}
              onClick={handleEditTag}
            >
              บันทึก
            </Button>
          </Modal.Footer>
        </Modal>

        {/* Modal สำหรับลบ */}
        <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)} centered>
          <Modal.Header closeButton>
            <Modal.Title>ยืนยันการลบ</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            คุณแน่ใจว่าต้องการลบหมวดหมู่นี้: <strong>{selectedTag?.tags}</strong>?
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
              ยกเลิก
            </Button>
            <Button variant="danger" onClick={handleDeleteTag}>
              ลบ
            </Button>
          </Modal.Footer>
        </Modal>
      </div>
    </div>
  );
};

export default ManageCate;
