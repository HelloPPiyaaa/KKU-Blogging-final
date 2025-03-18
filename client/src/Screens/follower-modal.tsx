import { useCallback, useEffect, useMemo, useState } from "react";
import { fetchFollow, fetchProfile } from "../api/follow";
import { Button, Modal } from "react-bootstrap";

export function FollowerModal({ userProfile }: any) {
  const [smShow, setSmShow] = useState(false);
  const [myUser, setMyUser] = useState<any>(null);
  const [isFollowerModal, setIsFollowerModal] = useState<boolean>(false);

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

  const CheckFollower = useMemo(() => {
    const newData: string[] = [];
    userProfile?.followers?.forEach((e: any) => {
      const isFollowing = myUser?.following?.some((follower: any) => follower._id === e);
      if (isFollowing) {
        newData.push(e);
      }
    });
    return newData;
  }, [userProfile, myUser, isFollowerModal]);

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
      setIsFollowerModal(followerData.newFollow.if_followed);
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
      setIsFollowerModal(false);
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
        <p className="m-0">{`${userProfile?.followers?.length} followers`}</p>
      </Button>
      <Modal
        size="sm"
        centered
        show={smShow}
        onHide={() => setSmShow(false)}
        aria-labelledby="example-modal-sizes-title-sm"
      >
        <Modal.Header closeButton>
          <Modal.Title id="example-modal-sizes-title-sm">ผู้ติดตาม</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {currentUser?.followers?.length > 0 ? (
            currentUser.followers.map((c: any) => (
              <div
                key={c + "s"}
                style={{
                  display: "flex",
                  gap: "1rem",
                  padding: "0.5rem",
                  alignItems: "center",
                  justifyContent: "space-between"
                }}
              >
                <div className="d-flex justify-content-start">
                  <a href={`/user/${c._id}`} style={{ textDecoration: "none" }}>
                    <p
                      style={{
                        padding: "0 10px 0 10px",
                        margin: 0,
                        color: "black"
                      }}
                    >
                      {c.fullname}
                    </p>
                  </a>
                </div>
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
                  ) : CheckFollower?.some((follower: any) => follower === c._id) ? (
                    <Button
                      style={{
                        backgroundColor: "gray",
                        color: "white",
                        border: "none"
                      }}
                      onClick={() => handleUnfollow(c)}
                    >
                      ติดตามแล้ว
                    </Button>
                  ) : (
                    <Button
                      style={{
                        backgroundColor: "black",
                        color: "white",
                        border: "none"
                      }}
                      onClick={() => handleFollow(c)}
                    >
                      ติดตาม
                    </Button>
                  )}
                </div>
              </div>
            ))
          ) : (
            <p style={{ textAlign: "center", color: "gray" }}>ไม่มีบัญชีที่ติดตาม</p>
          )}
        </Modal.Body>
      </Modal>
    </>
  );
}
