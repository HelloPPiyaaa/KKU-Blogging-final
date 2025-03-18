import React, { useEffect, useState } from "react";
import axios from "axios";
import ReportDetailsModal from "../components/report-view-modal";
import ConfirmCancelModal from "../components/ConfirmCancelModal"; // Import the confirmation modal

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

const ReportCheck: React.FC = () => {
  const API_BASE_URL = process.env.REACT_APP_API_ENDPOINT;
  const [reports, setReports] = useState<Report[]>([]);
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [showConfirmCancelModal, setShowConfirmCancelModal] = useState(false);
  const [reportToCancel, setReportToCancel] = useState<string | null>(null); // Track which report to cancel

  // ฟังก์ชันเพื่อดึงข้อมูลรีพอร์ตจาก API
  const fetchReports = async () => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/api/report/by/${sessionStorage.getItem("userId")}`
      );
      setReports(response.data);
    } catch (error) {
      console.error("Error fetching reports:", error);
    }
  };

  // ฟังก์ชันลบรายงาน
  const handleCancelReport = async () => {
    if (reportToCancel) {
      try {
        const userData = sessionStorage.getItem("user");
        const token: string | null = userData
          ? JSON.parse(userData).access_token
          : null;

        if (!token) {
          console.error("No access token found");
        } else {
          await axios.patch(
            `${API_BASE_URL}/api/report/${reportToCancel}/cancel`,
            {},
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );
        }
        setReports((prevReports) =>
          prevReports.filter((report) => report._id !== reportToCancel)
        );
        setShowConfirmCancelModal(false); // Close confirmation modal
      } catch (error) {
        console.error("Error deleting report:", error);
      }
    }
  };

  // ฟังก์ชันเพื่อแสดงรายละเอียดของรีพอร์ต
  const handleShowModal = (report: Report) => {
    setSelectedReport(report);
    setShowModal(true);
  };

  // ฟังก์ชันปิด Modal
  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedReport(null);
  };

  // ฟังก์ชันแสดง Confirmation Modal
  const handleOpenConfirmCancelModal = (reportId: string) => {
    setReportToCancel(reportId); // Set the report to cancel
    setShowConfirmCancelModal(true); // Open the modal
  };

  // ฟังก์ชันปิด Confirmation Modal
  const handleCloseConfirmCancelModal = () => {
    setShowConfirmCancelModal(false);
    setReportToCancel(null); // Reset the selected report to cancel
  };

  // ฟังก์ชันรีเฟรชรายงานหลังจากการดำเนินการ
  const refreshReports = () => {
    fetchReports(); // Refetch reports after an action (verify, delete, etc.)
  };

  // เรียกใช้ฟังก์ชันดึงข้อมูลเมื่อโหลดหน้าจอ
  useEffect(() => {
    fetchReports();
  }, []);

  return (
    <>
      {selectedReport && (
        <ReportDetailsModal
          showModal={showModal}
          handleClose={handleCloseModal}
          report={selectedReport}
          refreshReports={refreshReports}
        />
      )}
      <ConfirmCancelModal
        showModal={showConfirmCancelModal}
        onCancel={handleCloseConfirmCancelModal}
        onConfirm={handleCancelReport}
        handleClose={handleCloseConfirmCancelModal}
      />
      <div style={{ margin: "2% 2%", fontSize: "14px" }}>
        <h4>รายงานปัญหาทั้งหมด</h4>
        <div
          style={{
            maxHeight: "500px",
            overflowY: "auto",
            overflowX: "auto",
            border: reports.length > 0 ? "1px solid #ddd" : "none", // Conditionally add the border
            borderRadius: "8px",
          }}
        >
          {reports.length === 0 ? (
            <p
              style={{
                textAlign: "center",
                padding: "20px",
                fontSize: "20px",
                margin: "20%",
              }}
            >
              ไม่มีการรายงาน
            </p>
          ) : (
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead
                style={{ position: "sticky", top: 0, backgroundColor: "#fff" }}
              >
                <tr>
                  <th style={{ padding: "10px", textAlign: "center" }}>
                    ผู้ที่ถูกรายงานโพสต์
                  </th>
                  <th style={{ padding: "10px", textAlign: "center" }}>
                    เหตุผล
                  </th>
                  <th style={{ padding: "10px", textAlign: "center" }}>
                    สถานะ
                  </th>
                  <th style={{ padding: "10px", textAlign: "center" }}>
                    วันที่รายงาน
                  </th>
                  <th style={{ padding: "10px", textAlign: "center" }}>
                    รายละเอียด
                  </th>
                </tr>
              </thead>
              <tbody>
                {reports.map((report) => (
                  <tr
                    key={report._id}
                    style={{ borderBottom: "1px solid #ddd" }}
                  >
                    <td style={{ padding: "10px" }}>
                      {report.post
                        ? report.post.author.fullname
                        : "โพสต์ถูกลบแล้ว"}
                    </td>
                    <td style={{ padding: "10px" }}>{report.reason}</td>
                    <td style={{ padding: "10px" }}>
                      {report.status === "Approved"
                        ? "อนุมัติ"
                        : report.status === "Pending"
                        ? "รอดำเนินการ"
                        : report.status === "Cancel"
                        ? "โพสต์ถูกลบ/ยกเลิกรายงาน"
                        : "ปฏิเสธ"}
                    </td>
                    <td style={{ padding: "10px" }}>
                      {new Date(report.createdAt).toLocaleDateString()}
                    </td>
                    <td style={{ padding: "10px", textAlign: "center" }}>
                      {report.post ? (
                        <button
                          style={{
                            marginRight: "10px",
                            padding: "5px 10px",
                            backgroundColor: "#4CAF50",
                            color: "white",
                            border: "none",
                            borderRadius: "4px",
                          }}
                          onClick={() => handleShowModal(report)}
                        >
                          ดูรายละเอียด
                        </button>
                      ) : (
                        <button
                          style={{
                            marginRight: "10px",
                            padding: "5px 10px",
                            backgroundColor: "#939393",
                            color: "white",
                            border: "none",
                            borderRadius: "4px",
                          }}
                          disabled={true}
                        >
                          ดูรายละเอียด
                        </button>
                      )}

                      {report.status === "Pending" ? (
                        <button
                          style={{
                            padding: "5px 10px",
                            backgroundColor: "#f44336",
                            color: "white",
                            border: "none",
                            borderRadius: "4px",
                          }}
                          onClick={() =>
                            handleOpenConfirmCancelModal(report._id)
                          } // Open confirmation modal
                        >
                          ยกเลิก
                        </button>
                      ) : (
                        <button
                          disabled={true}
                          style={{
                            padding: "5px 10px",
                            backgroundColor: "#939393",
                            color: "white",
                            border: "none",
                            borderRadius: "4px",
                          }}
                        >
                          ยกเลิก
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </>
  );
};

export default ReportCheck;
