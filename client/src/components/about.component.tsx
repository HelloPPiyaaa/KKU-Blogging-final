import { Link } from "react-router-dom";
import "../misc/edit-profile.css";
import React from "react";
import { getFullday } from "../common/date";

interface AboutUserProps {
  className?: string;
  bio: string; // bio เป็น string
  social_links: { [key: string]: string } | null;
  joinedAt: string;
}

const AboutUser: React.FC<AboutUserProps> = ({
  className,
  bio,
  social_links,
  joinedAt,
}) => {
  return (
    <div className={"about-user " + className}>
      <p className="m-0" style={{ lineHeight: "1.75rem" }}>
        {bio.length ? bio : "ไม่ได้อ่านอะไร"}
      </p>

      <div
        className="d-flex flex-wrap align-items-center icon-social-link"
        style={{
          color: "#494949",
        }}
      >
        {social_links &&
        Object.keys(social_links).some((key) => social_links[key]) ? (
          Object.keys(social_links).map((key) => {
            const link = social_links[key];
            return link ? (
              <Link
                to={link}
                key={key}
                target="_blank"
                style={{ color: "inherit" }}
              >
                <i
                  className={`bi bi-${
                    key !== "website" ? key : "globe"
                  } hover:text-black`}
                ></i>
              </Link>
            ) : null;
          })
        ) : (
          <p>ไม่มีลิงก์โซเชียล</p>
        )}
      </div>

      <p className="m-0" style={{ color: "#494949", lineHeight: "1.75rem" }}>
        เข้าร่วมเมื่อ {getFullday(joinedAt)}
      </p>
    </div>
  );
};

export default AboutUser;
