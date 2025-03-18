import React, { useEffect, useState } from "react";
import { Bar } from "react-chartjs-2"; // เปลี่ยนเป็น Bar
import { Card, Row, Col } from "react-bootstrap";
import { IoHeart } from "react-icons/io5";
import { FaCommentDots } from "react-icons/fa";
import { fetchBlogById, fetchViews } from "../api/adminProfile";
import { Dropdown } from "react-bootstrap";

// กำหนดประเภทข้อมูลสำหรับโครงสร้างข้อมูลการเข้าชม
interface ViewData {
  _id: string;
  month: string;
  year: number;
  blog: string;
  __v: number;
  createdAt: string;
  total_reads: number;
  updatedAt: string;
}

// กำหนดประเภทข้อมูลสำหรับการนับการเข้าชมรายเดือนและรายปี
interface MonthlyViewCount {
  month: string;
  viewCount: number;
}

interface YearlyViewCount {
  year: string;
  viewCount: number;
}

// ฟังก์ชันเพื่อคำนวณการนับการเข้าชมรายเดือนจากข้อมูลที่ดึงมา
const getMonthlyViewCounts = (data: ViewData[]): MonthlyViewCount[] => {
  const months = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];

  // เริ่มต้นการนับการเข้าชมรายเดือนด้วยค่า 0
  const monthlyViewCounts: MonthlyViewCount[] = months.map((month) => ({
    month,
    viewCount: 0,
  }));

  // รวมการเข้าชมสำหรับแต่ละเดือน
  data.forEach((entry) => {
    const monthIndex = months.indexOf(entry.month);
    if (monthIndex !== -1) {
      monthlyViewCounts[monthIndex].viewCount += entry.total_reads;
    }
  });

  return monthlyViewCounts;
};

// ฟังก์ชันเพื่อคำนวณการนับการเข้าชมรายปีจากข้อมูลที่ดึงมา
const getYearlyViewCounts = (data: ViewData[]): YearlyViewCount[] => {
  const currentYear = new Date().getFullYear();

  // สร้างอาร์เรย์สำหรับปีที่ผ่านมา 5 ปี
  const yearsRange = Array.from(
    { length: 5 },
    (_, index) => currentYear - 2 + index
  );

  // เริ่มต้นการนับการเข้าชมรายปีด้วยค่า 0
  const yearlyViewCounts: YearlyViewCount[] = yearsRange.map((year) => ({
    year: year.toString(),
    viewCount: 0,
  }));

  // รวมการเข้าชมสำหรับแต่ละปี
  data.forEach((entry) => {
    if (typeof entry.year === "number") {
      const yearIndex = yearlyViewCounts.findIndex(
        (y) => y.year === entry.year.toString()
      );
      if (yearIndex !== -1) {
        yearlyViewCounts[yearIndex].viewCount += entry.total_reads;
      }
    }
  });

  return yearlyViewCounts;
};

// คอมโพเนนต์หลัก
export default function DashboardUser() {
  // ดึง userId จาก session storage
  const userId = sessionStorage.getItem("userId");

  // ตัวแปรสถานะสำหรับช่วงเวลาและการนับต่างๆ
  const [timeRange, setTimeRange] = useState("Month");
  const [getBlog, setGetBlog] = useState<any[]>([]);
  const [totalLikes, setTotalLikes] = useState(0);
  const [totalComments, setTotalComments] = useState(0);
  const [totalReads, setTotalReads] = useState(0);
  const [totalViewsMonth, setTotalViewsMonth] = useState<any[]>([]);
  const [totalViewsYear, setTotalViewsYear] = useState<any[]>([]);

  // ดึงข้อมูลเมื่อคอมโพเนนต์ถูกติดตั้ง
  useEffect(() => {
    const fetchData = async () => {
      try {
        const AllPost = await fetchBlogById(userId); // ดึงโพสต์ทั้งหมดของผู้ใช้
        const view = await fetchViews(); // ดึงข้อมูลการเข้าชม
        setGetBlog(AllPost);
        setTotalViewsMonth(getMonthlyViewCounts(view)); // คำนวณการเข้าชมรายเดือน
        setTotalViewsYear(getYearlyViewCounts(view)); // คำนวณการเข้าชมรายปี
      } catch (error) {
        console.error("Error fetching user count:", error);
      }
    };
    fetchData();
  }, []);

  // คำนวณผลรวมเมื่อข้อมูลโพสต์มีการเปลี่ยนแปลง
  useEffect(() => {
    calculateTotals(getBlog);
  }, [getBlog]);

  // ฟังก์ชันเพื่อคำนวณผลรวมของจำนวนไลค์และความคิดเห็น
  const calculateTotals = (data: any) => {
    let likes = 0;
    let comments = 0;
    let reads = 0;

    data?.forEach((blog: any) => {
      likes += blog.activity.total_likes; // รวมไลค์
      comments += blog.activity.total_comments; // รวมความคิดเห็น
      reads += blog.activity.total_reads; // รวมการเข้าชม
    });

    // อัปเดตสถานะด้วยผลรวม
    setTotalLikes(likes);
    setTotalComments(comments);
    setTotalReads(reads);
  };

  // กำหนดข้อมูลสำหรับกราฟการเข้าชมรายเดือน
  const monthData = {
    labels: totalViewsMonth.map((e) => e.month),
    datasets: [
      {
        label: "จำนวนผู้เข้าชม",
        data: totalViewsMonth.map((e) => e.viewCount),
        backgroundColor: "rgba(239, 209, 242, 1.0)",
        borderColor: "rgba(177, 156, 215, 1.0)",
        tension: 0.5,
        fill: true,
      },
    ],
  };

  // กำหนดข้อมูลสำหรับกราฟการเข้าชมรายปี
  const yearData = {
    labels: totalViewsYear.map((e) => e.year),
    datasets: [
      {
        label: "จำนวนผู้เข้าชม",
        data: totalViewsYear.map((e) => e.viewCount),
        backgroundColor: "rgba(239, 209, 242, 1.0)",
        borderColor: "rgba(177, 156, 215, 1.0)",
        tension: 0.5,
        fill: true,
      },
    ],
  };

  // กำหนดข้อมูลกราฟตามช่วงเวลาที่เลือก
  const chartData = timeRange === "Month" ? monthData : yearData;

  return (
    <div className="container mt-4" style={{ padding: "30px 100px" }}>
      <div className="d-flex justify-content-center mb-4">
        <h4>สถิติการเข้าชมโพสต์</h4>
      </div>

      <div className="d-flex justify-content-between align-items-center mb-4">
        <div className="ms-auto">
          <Dropdown>
            <Dropdown.Toggle
              style={{
                backgroundColor: "#6c757d",
                color: "white",
                border: "none",
              }}
              id="dropdown-basic"
            >
              {timeRange || "เลือกช่วงเวลา"}
            </Dropdown.Toggle>

            <Dropdown.Menu>
              <Dropdown.Item onClick={() => setTimeRange("Month")}>
                ตลอดทั้งเดือน
              </Dropdown.Item>
              <Dropdown.Item onClick={() => setTimeRange("Year")}>
                ตลอดทั้งปี
              </Dropdown.Item>
            </Dropdown.Menu>
          </Dropdown>
        </div>
      </div>

      <div>
        <Bar
          data={chartData}
          options={{
            maintainAspectRatio: false,
            scales: {
              x: {
                grid: {
                  display: false,
                },
              },
              y: {
                beginAtZero: true,
                grid: {
                  display: false,
                },
              },
            },
          }}
          height={400}
        />
      </div>
    </div>
  );
}
