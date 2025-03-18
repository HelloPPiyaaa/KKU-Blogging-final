import axios from "axios";
import React, { useEffect, useState, useContext } from "react";

import { UserContext } from "../App";

const API_BASE_URL = process.env.REACT_APP_API_ENDPOINT;

const NotiSettings: React.FC = () => {
  const { NotificationShow, setNotificationShow } = useContext(UserContext); 
  const [executiveProgram, setExecutiveProgram] = useState<boolean>(true);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchNotificationStatus = async () => {
      try {
        const storedUser = sessionStorage.getItem("user");
        if (!storedUser) {
          console.error("No user data found in sessionStorage");
          return;
        }

        const { access_token } = JSON.parse(storedUser);
        if (!access_token) {
          console.error("No access token found");
          return;
        }

        const { data } = await axios.post(
          `${API_BASE_URL}/profile/notification-status`,
          {},
          {
            headers: { Authorization: `Bearer ${access_token}` },
          }
        );

        if (data.success) {
          setNotificationShow(data.notification_enable);
          setExecutiveProgram(data.notification_email_enable);
        } else {
          console.error("Failed to fetch notification settings");
        }
        setLoading(false);
      } catch (error) {
        console.error("Error fetching notification status:", error);
        setLoading(false);
      }
    };

    fetchNotificationStatus();
  }, [setNotificationShow]); 

  const handleToggle = async (
    type: "flightUpdates" | "executiveProgram",
    value: boolean
  ) => {
    try {
      const storedUser = sessionStorage.getItem("user");
      if (!storedUser) return;
      const { access_token } = JSON.parse(storedUser);

      const endpoint =
        type === "flightUpdates"
          ? "notification-enable"
          : "notification-email-enable";

      await axios.patch(
        `${API_BASE_URL}/profile/${endpoint}`,
        { enable: value },
        { headers: { Authorization: `Bearer ${access_token}` } }
      );

      if (type === "flightUpdates") {
        setNotificationShow(value);
      } else {
        setExecutiveProgram(value);
      }
    } catch (error) {
      console.error(`Error updating ${type}:`, error);
    }
  };

  return (
    <>
      {loading ? (
        <p>Loading...</p>
      ) : (
        <div
          style={{
            width: "100%",
            padding: "16px",
            fontFamily: "Arial, sans-serif",
            color: "#333",
            
          }}
        >
          <h4 >ตั้งค่าการแจ้งเตือน</h4>
          {[  
            {
              title: "การแจ้งเตือนทั่วไป",
              subtitle: "เมื่อทำการปิดการแจ้งเตือนทั่วไป คุณจะสามารถดูการแจ้งเตือนทั้งหมดได้ตามปกติแต่จะไม่สามารถรับจำนวนหรือข้อความของการแจ้งเตือนที่เข้ามาได้.",
              value: NotificationShow,
              type: "flightUpdates",
            },
            {
              title: "การแจ้งเตือนผ่าน Gmail",
              subtitle: "เมื่อทำการปิดการแจ้งเตือนผ่าน Gmail คุณจะไม่ได้รับข้อความแจ้งเตือนใดๆ เกี่ยวกับอีเมลใหม่หรือการเปลี่ยนแปลงที่เกิดขึ้นในบัญชี Gmail ของคุณ.",
              value: executiveProgram,
              type: "executiveProgram",
            },
          ].map(({ title, subtitle, value, type }, index) => (
            <div
              key={index}
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "12px 0",
                borderBottom: index === 0 ? "1px solid #e0e0e0" : "none",
                fontFamily:"Arial, sans-serif"
              }}
            >
              <div>
                <div style={{ fontSize: "16px" }}>{title}</div>
                <div style={{ fontSize: "12px", color: "#757575" }}>{subtitle}</div>
              </div>

              <label
                style={{
                  position: "relative",
                  display: "inline-block",
                  width: "36px",
                  height: "20px",
                }}
              >
                <input
                  type="checkbox"
                  checked={value}
                  onChange={() => handleToggle(type as "flightUpdates" | "executiveProgram", !value)}
                  style={{ opacity: 0, width: 0, height: 0 }}
                />
                <span
                  style={{
                    position: "absolute",
                    cursor: "pointer",
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: value ? "#4CAF50" : "#ccc",
                    transition: ".4s",
                    borderRadius: "34px",
                  }}
                />
                <span
                  style={{
                    position: "absolute",
                    height: "16px",
                    width: "16px",
                    left: value ? "18px" : "4px",
                    bottom: "2px",
                    backgroundColor: "white",
                    transition: ".4s",
                    borderRadius: "50%",
                  }}
                />
              </label>
            </div>
          ))}
        </div>
      )}
    </>
  );
};

export default NotiSettings;
