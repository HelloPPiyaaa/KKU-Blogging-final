import { useCallback, useEffect, useMemo, useState } from "react";
import { fetchFollow, fetchProfile } from "../api/follow";
import { Button, Modal } from "react-bootstrap";
import { Link } from "react-router-dom";

export function FollowingModal({ userProfile }: any) {
  const [smShow, setSmShow] = useState(false);
  const [myUser, setMyUser] = useState<any>(null);
  const [isFollowingModal, setIsFollowingModal] = useState<boolean>(false);
  const [currentUser, setCurrentUser] = useState<any>([]);

  const handleButtonClick = async () => {
    setSmShow(true);
    const me = sessionStorage.getItem("userId");
    if (me) {
      try {
        const profileData = await fetchProfile(me);
        const resx = await fetchFollow(userProfile._id);
        setMyUser(profileData);
        setCurrentUser(resx);
      } catch (error) {
        console.error("Failed to fetch profile:", error);
      }
    }
  };

  const CheckFollowing = useMemo(() => {
    const newData: string[] = [];
    userProfile?.following?.forEach((e: any) => {
      const isFollowing = myUser?.following?.some((follower: any) => follower._id === e);
      if (isFollowing) {
        newData.push(e);
      }
    });
    return newData;
  }, [userProfile, myUser, isFollowingModal]);

  const handleFollow = useCallback(async (you: string) => {
    const API_BASE_URL = `${process.env.REACT_APP_API_ENDPOINT}/follow`;
    try {
      const response = await fetch(API_BASE_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          me: sessionStorage.getItem("userId"),
          you: you
        })
      });

      if (!response.ok) {
        const statusText = response.statusText || "Unknown Error";
        throw new Error(`Server returned ${response.status} ${statusText} for ${API_BASE_URL}`);
      }
      const followerData = await response.json();
      setIsFollowingModal(followerData.newFollow.if_followed);
      const updatedProfile = await fetchProfile(sessionStorage.getItem("userId"));
      setMyUser(updatedProfile);
    } catch (error) {
      console.error("Error:", (error as Error).message);
    }
  }, []);

  const handleUnfollow = useCallback(async (you: string) => {
    const API_BASE_URL_DELETE = `${process.env.REACT_APP_API_ENDPOINT}/follow/delete`;
    try {
      const response = await fetch(API_BASE_URL_DELETE, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          me: sessionStorage.getItem("userId"),
          you: you
        })
      });
      if (!response.ok) {
        const statusText = response.statusText || "Unknown Error";
        throw new Error(`Server returned ${response.status} ${statusText} for ${API_BASE_URL_DELETE}`);
      }
      const res = await response.json();
      setIsFollowingModal(false);
      const updatedProfile = await fetchProfile(sessionStorage.getItem("userId"));
      setMyUser(updatedProfile);
    } catch (error) {
      console.error("Error:", (error as Error).message);
    }
  }, []);

  return (
    <>
      <Button
        onClick={handleButtonClick}
        className="me-2"
        style={{ backgroundColor: "white", color: "black", border: "none" }}
      >
        <p className="m-0">{`${userProfile?.following?.length} following`}</p>
      </Button>
      <Modal
        size="sm"
        centered
        show={smShow}
        onHide={() => setSmShow(false)}
        aria-labelledby="example-modal-sizes-title-sm"
      >
        <Modal.Header closeButton>
          <Modal.Title id="example-modal-sizes-title-sm">กำลังติดตาม</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {currentUser?.following?.length > 0 ? (
            currentUser.following.map((c: any) => (
              <div
                key={c._id}
                style={{
                  display: "flex",
                  gap: "1rem",
                  padding: "0.5rem",
                  alignItems: "center"
                }}
              >
                <Link
                  to={`/user/${c._id}`}
                  style={{
                    flex: 1,
                    textDecoration: "none"
                  }}
                >
                  <p style={{ color: "black" }}>{c.fullname}</p>
                </Link>
                <div className="d-flex justify-content-end">
                  {sessionStorage.getItem("userId") === c._id ? (
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
                  ) : CheckFollowing?.some((follower: any) => follower === c._id) ? (
                    <Button
                      onClick={() => handleUnfollow(c._id)}
                      style={{
                        backgroundColor: "gray",
                        color: "white",
                        border: "none"
                      }}
                    >
                      ติดตามแล้ว
                    </Button>
                  ) : (
                    <Button
                      onClick={() => handleFollow(c._id)}
                      style={{
                        backgroundColor: "black",
                        color: "white",
                        border: "none"
                      }}
                    >
                      ติดตาม
                    </Button>
                  )}
                </div>
              </div>
            ))
          ) : (
            <p style={{ textAlign: "center", color: "gray" }}>ไม่มีบัญชีที่กำลังติดตาม</p>
          )}
        </Modal.Body>
      </Modal>
    </>
  );
}
