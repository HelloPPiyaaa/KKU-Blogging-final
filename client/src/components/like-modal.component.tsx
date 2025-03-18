import React, { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { API_BASE_URL } from "../api/post";
import { Button } from "react-bootstrap";
import { fetchProfile } from "../api/follow";

const LikeModal = ({
  isOpen,
  onClose,
  postId,
  accessToken
}: {
  isOpen: boolean;
  onClose: () => void;
  postId: string;
  accessToken: string;
}) => {
  const [likes, setLikes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [followStatus, setFollowStatus] = useState<{ [key: string]: boolean }>({});
  const [myUser, setMyUser] = useState<any | null>(null);

  useEffect(() => {
    const fetchingProfile = async (userId: string) => {
      try {
        const response = fetchProfile(userId);
        return response;
      } catch (error: any) {
        console.error("Error fetching profile:", error);
        throw error.response?.data?.message || "Error fetching profile";
      }
    };

    const userId = sessionStorage.getItem("userId");
    if (userId) {
      fetchingProfile(userId).then((data) => {
        setMyUser(data);
      });
    }
  }, []);

  useEffect(() => {
    if (myUser) {
      const newFollowStatus: { [key: string]: boolean } = {};
      likes.forEach((like) => {
        const isFollowing = myUser.following?.some(
          (follower: any) => follower._id === like.user._id
        );
        newFollowStatus[like.user._id] = isFollowing;
      });
      setFollowStatus(newFollowStatus);
    }
  }, [myUser, likes]);

  useEffect(() => {
    if (isOpen && postId) {
      fetchLikes();
    }
  }, [isOpen, postId]);

  const handleFollow = useCallback(async (userId: string) => {
    const API_BASE_URL = `${process.env.REACT_APP_API_ENDPOINT}/follow`;
    try {
      const response = await fetch(API_BASE_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          me: sessionStorage.getItem("userId"),
          you: userId
        })
      });
      if (!response.ok) {
        const statusText = response.statusText || "Unknown Error";
        throw new Error(`Server returned ${response.status} ${statusText} for ${API_BASE_URL}`);
      }
      const followerData = await response.json();
      setFollowStatus((prevStatus) => ({
        ...prevStatus,
        [userId]: true
      }));
      console.log("Followed successfully:", followerData);
    } catch (error) {
      console.error("Error following user:", error);
    }
  }, []);

  const handleUnfollow = useCallback(async (userId: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/follow/delete`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          me: sessionStorage.getItem("userId"),
          you: userId
        })
      });
      if (!response.ok) {
        const statusText = response.statusText || "Unknown Error";
        throw new Error(
          `Server returned ${response.status} ${statusText} for ${API_BASE_URL}/follow/delete`
        );
      }
      const res = await response.json();
      setFollowStatus((prevStatus) => ({
        ...prevStatus,
        [userId]: false
      }));
      console.log("Unfollowed successfully:", res);
    } catch (error) {
      console.error("Error unfollowing user:", error);
    }
  }, []);

  const fetchLikes = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await axios.get(`${API_BASE_URL}/posts/${postId}/likes`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json"
        }
      });

      setLikes(response.data);
    } catch (error: any) {
      console.error("Error fetching likes:", error);
      setError(error.response?.data?.message || "Error fetching likes");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center"
      style={{
        backgroundColor: "rgba(0, 0, 0, 0.25)",
        backdropFilter: "blur(4px)",
        zIndex: 1050
      }}
      onClick={onClose}
    >
      <div
        className="bg-white rounded-3 shadow"
        style={{
          width: "90%",
          maxWidth: "400px",
          maxHeight: "80vh"
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="d-flex justify-content-between align-items-center p-3 border-bottom">
          <h6 className="m-0">ผู้ใช้ที่กดถูกใจ</h6>
          <button type="button" className="btn-close" onClick={onClose} aria-label="Close" />
        </div>

        <div style={{ maxHeight: "calc(80vh - 60px)", overflowY: "auto" }}>
          {loading ? (
            <div className="d-flex justify-content-center p-4">
              <div className="spinner-border spinner-border-sm text-primary" />
            </div>
          ) : error ? (
            <div className="text-center p-4 text-danger">{error}</div>
          ) : likes.length > 0 ? (
            <div className="p-2">
              {likes.map((like) => (
                <div key={like._id} className="d-flex align-items-center p-2 hover-bg-light">
                  <Link to={`/user/${like.user._id}`}>
                    <img
                      src={like.user.profile_picture}
                      alt={like.user.username}
                      className="rounded-circle me-3"
                      style={{
                        width: "40px",
                        height: "40px",
                        objectFit: "cover",
                        border: "1px solid #dee2e6"
                      }}
                    />
                  </Link>
                  <div className="flex-grow-1">
                    <Link
                      to={`/user/${like.user._id}`}
                      className="text-decoration-none text-dark fw-medium"
                    >
                      {like.user.fullname}
                    </Link>
                    <div className="text-muted small">@{like.user.username}</div>
                  </div>
                  {like.user._id === myUser?._id ? (
                    <Button
                      style={{
                        backgroundColor: "black",
                        color: "white",
                        border: "none"
                      }}
                      disabled
                    >
                      คุณ
                    </Button>
                  ) : (
                    <Button
                      style={{
                        backgroundColor: followStatus[like.user._id] ? "gray" : "black",
                        color: "white",
                        border: "none"
                      }}
                      onClick={() =>
                        followStatus[like.user._id]
                          ? handleUnfollow(like.user._id)
                          : handleFollow(like.user._id)
                      }
                    >
                      {followStatus[like.user._id] ? "ติดตามแล้ว" : "ติดตาม"}
                    </Button>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center p-4 text-muted">ไม่มีผู้ใช้กดถูกใจ</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LikeModal;