import React, { useEffect, useRef, useState } from "react";
import Chart from "chart.js/auto";

interface GrowthChartAllblogProps {
  data: any[];
}

interface BlogCount {
  label: string;
  count: number;
}

function transformBlogData(blogs: any[], mode: string, selectedDate: string): BlogCount[] {
  const countData: { [key: string]: number } = {};

  if (blogs && Array.isArray(blogs)) {
    blogs.forEach((blog) => {
      const date = new Date(blog.publishedAt);
      const year = date.getFullYear().toString();
      const month = date.toLocaleString("default", { month: "short" });

      if (mode === "yearly" && selectedDate === year) {
        countData[month] = (countData[month] || 0) + 1;
      } else if (mode === "monthly") {
        const selectedMonthYear = new Date(selectedDate);
        if (date.getFullYear() === selectedMonthYear.getFullYear() && date.getMonth() === selectedMonthYear.getMonth()) {
          const day = date.getDate().toString();
          countData[day] = (countData[day] || 0) + 1;
        }
      }
    });
  }

  return Object.keys(countData)
    .map((key) => ({ label: key, count: countData[key] }))
    .sort((a, b) => (isNaN(parseInt(a.label)) ? 0 : parseInt(a.label) - parseInt(b.label)));
}

const GrowthChartAllblog: React.FC<GrowthChartAllblogProps> = ({ data }) => {
  const chartRef = useRef<HTMLCanvasElement>(null);
  const chartInstance = useRef<Chart | null>(null);
  const [charts, setCharts] = useState<BlogCount[]>([]);
  const [viewMode, setViewMode] = useState<"monthly" | "yearly">("yearly");
  const [selectedDate, setSelectedDate] = useState<string>(new Date().getFullYear().toString());

  useEffect(() => {
    setCharts(transformBlogData(data, viewMode, selectedDate));
  }, [data, viewMode, selectedDate]);

  useEffect(() => {
    if (chartRef.current && charts.length > 0) {
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }
      const ctx = chartRef.current.getContext("2d");
      if (ctx) {
        chartInstance.current = new Chart(ctx, {
          type: "bar",
          data: {
            labels: charts.map((item) => item.label),
            datasets: [
              {
                label: viewMode === "yearly" ? "จำนวนโพสต์ต่อเดือน" : "จำนวนโพสต์ต่อวัน",
                data: charts.map((item) => item.count),
                backgroundColor: "rgba(75, 192, 192, 0.2)",
                borderColor: "rgba(75, 192, 192, 1)",
                borderWidth: 1,
              },
            ],
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
              y: {
                beginAtZero: true,
                grid: { display: false },
                ticks: { font: { size: 14 } },
              },
              x: {
                grid: { display: false },
                ticks: { font: { size: 14 } },
              },
            },
            plugins: {
              legend: {
                labels: { font: { size: 14 } },
              },
            },
          },
        });
      }
    }
  }, [charts]);

  return (
    <div>
      <div style={{ display: "flex", gap: "10px", margin: "20px", justifyContent: "flex-end" }}>
        <select value={viewMode} onChange={(e) => setViewMode(e.target.value as "monthly" | "yearly")}
          style={{ backgroundColor: "#7380ec", color: "white", border: "1px solid #5c6bc0", padding: "5px 10px", borderRadius: "5px" }}>
          <option value="yearly">รายปี</option>
          <option value="monthly">รายเดือน</option>
        </select>
        {viewMode === "yearly" ? (
          <select value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)}>
            {Array.from({ length: 5 }, (_, i) => {
              const year = new Date().getFullYear() - i;
              return <option key={year} value={year.toString()}>{year}</option>;
            })}
          </select>
        ) : (
          <input type="month" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} />
        )}
      </div>
      {charts.length === 0 ? (
        <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "50vh" }}>
          <p style={{ fontSize: "18px", color: "#888" }}>ไม่มีข้อมูล</p>
        </div>
      ) : (
        <div style={{ width: "100%", height: "300px" }}>
          <canvas ref={chartRef} />
        </div>
      )}
    </div>
  );
};

export default GrowthChartAllblog;
