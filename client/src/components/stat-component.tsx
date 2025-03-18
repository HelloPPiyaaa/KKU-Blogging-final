import React, { useContext, useEffect, useState } from "react";
import axios from "axios";
import { UserContext } from "../App";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

interface WeeklyStat {
  day: number;
  likes: number;
  comments: number;
  saves: number;
  reads: number;
}

interface yearlyStats {
  month: number;
  likes: number;
  comments: number;
  saves: number;
  reads: number;
}

interface Stat {
  dailyLikes: number;
  weeklyStats?: WeeklyStat[];
  monthlyLikes: number;
  yearlyStats?: yearlyStats[];
  dailySaves: number;
  monthlySaves: number;
  yearlySaves: number;
  dailyComments: number;
  monthlyComments: number;
  yearlyComments: number;
  dailyReads: number;
  monthlyReads: number;
  yearlyReads: number;
}

interface PostStatisticsChartProps {
  postId: string;
}

type Timeframe = "daily" | "weekly" | "monthly" | "yearly";

const PostStatisticsChart: React.FC<PostStatisticsChartProps> = ({
  postId,
}) => {
  const [stats, setStats] = useState<Stat | null>(null);
  const [timeframe, setTimeframe] = useState("daily");
  const {
    userAuth: { access_token },
  } = useContext(UserContext);

  useEffect(() => {
    const fetchStatistics = async () => {
      try {
        const response = await axios.get(
          `${process.env.REACT_APP_API_ENDPOINT}/posts/${postId}/statistics`,
          {
            headers: { Authorization: `Bearer ${access_token}` },
          }
        );
        setStats(response.data);
        console.log("Fetched Stats:", response.data);
      } catch (error) {
        console.error("Error fetching statistics:", error);
      }
    };
    fetchStatistics();
  }, [postId, access_token]);

  if (!stats) {
    return <div>Loading...</div>;
  }

  const dayMap = [
    "อาทิตย์",
    "จันทร์",
    "อังคาร",
    "พุธ",
    "พฤหัส",
    "ศุกร์",
    "เสาร์",
  ];
  const weekMap = [
    "สัปดาห์ที่ 1",
    "สัปดาห์ที่ 2",
    "สัปดาห์ที่ 3",
    "สัปดาห์ที่ 4",
  ];
  const monthMap = [
    "ม.ค.",
    "ก.พ.",
    "มี.ค.",
    "เม.ย.",
    "พ.ค.",
    "มิ.ย.",
    "ก.ค.",
    "ส.ค.",
    "ก.ย.",
    "ต.ค.",
    "พ.ย.",
    "ธ.ค.",
  ];

  const weeklyData =
    stats.weeklyStats?.map((item) => ({
      day: dayMap[item.day] || "ไม่ทราบวัน",
      Likes: item.likes || 0,
      Comments: item.comments || 0,
      Saves: item.saves || 0,
      Reads: item.reads || 0,
    })) || [];

  const yearlyData =
    stats.yearlyStats?.map((item) => ({
      day: monthMap[item.month] || "ไม่ทราบเดือน",
      Likes: item.likes || 0,
      Comments: item.comments || 0,
      Saves: item.saves || 0,
      Reads: item.reads || 0,
    })) || [];

  const timeframeData = {
    daily: [
      {
        day: "วันนี้",
        Likes: stats.dailyLikes || 0,
        Comments: stats.dailyComments || 0,
        Saves: stats.dailySaves || 0,
        Reads: stats.dailyReads || 0,
      },
    ],
    weekly: weeklyData,
    monthly: [
      {
        month: "เดือนนี้",
        Likes: stats.monthlyLikes || 0,
        Comments: stats.monthlyComments || 0,
        Saves: stats.monthlySaves || 0,
        Reads: stats.monthlyReads || 0,
      },
    ],
    yearly: yearlyData,
  };

  return (
    <div
      className="p-4 "
      style={{
        width: "600px",
        right: "0",
      }}
    >
      <div className="d-flex justify-content-end">
        <button
          className={`btn btn-sm me-2 ${
            timeframe === "daily" ? "btn-secondary" : "btn-outline-secondary"
          }`}
          onClick={() => setTimeframe("daily")}
        >
          วัน
        </button>
        <button
          className={`btn btn-sm me-2 ${
            timeframe === "weekly" ? "btn-secondary" : "btn-outline-secondary"
          }`}
          onClick={() => setTimeframe("weekly")}
        >
          สัปดาห์
        </button>
        <button
          className={`btn btn-sm me-2 ${
            timeframe === "monthly" ? "btn-secondary" : "btn-outline-secondary"
          }`}
          onClick={() => setTimeframe("monthly")}
        >
          เดือน
        </button>
        <button
          className={`btn btn-sm ${
            timeframe === "yearly" ? "btn-secondary" : "btn-outline-secondary"
          }`}
          onClick={() => setTimeframe("yearly")}
        >
          ปี
        </button>
      </div>
      <ResponsiveContainer width="100%" height={200}>
        <BarChart
          data={timeframeData[timeframe as Timeframe]}
          margin={{ top: 10, right: 20, left: 20, bottom: 10 }}
        >
          <XAxis
            dataKey={timeframe === "monthly" ? "month" : "day"}
            stroke="#888"
            tickFormatter={(value) => value || "ไม่ทราบวัน"}
          />
          <YAxis stroke="#888" />
          <Tooltip wrapperStyle={{ backgroundColor: "#fff", color: "#333" }} />
          <Legend />
          <Bar dataKey="Likes" fill="#28a745" radius={[10, 10, 10, 10]} />
          <Bar dataKey="Comments" fill="#6a5acd" radius={[10, 10, 10, 10]} />
          <Bar dataKey="Saves" fill="#ff914d" radius={[10, 10, 10, 10]} />
          <Bar dataKey="Reads" fill="#17a2b8" radius={[10, 10, 10, 10]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default PostStatisticsChart;
