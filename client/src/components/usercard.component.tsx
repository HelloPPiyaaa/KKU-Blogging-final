import { Link } from "react-router-dom";
import { User } from "../types/user";
import React from "react";

interface UserCardProps {
  user: User;
}

const UserCard: React.FC<UserCardProps> = ({ user }) => {
  let { fullname, profile_picture, username, _id } = user;

  return (
    <Link
      to={`/user/${_id}`}
      className="d-flex gap-3 align-items-center mb-4"
      style={{ color: "inherit", textDecoration: "none" }}
    >
      <img
        src={profile_picture}
        className="rounded-circle"
        style={{ width: "50px", height: "50px" }}
        alt=""
      />

      <div>
        <h1 className="fw-medium m-0 line-clamp-2" style={{ fontSize: "16px" }}>
          {fullname}
        </h1>
        <p className="m-0" style={{ color: "#494949", fontSize: "13px" }}>
          @{username}
        </p>
      </div>
    </Link>
  );
};

export default UserCard;
