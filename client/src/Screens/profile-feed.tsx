import { useEffect, useState } from "react";
import { getPosts } from "../api/post";
import { Post } from "../types/post";
import { IoIosHeartEmpty } from "react-icons/io";
import { IoBookmarkOutline } from "react-icons/io5";
import { useParams, useNavigate } from "react-router-dom";
import { Badge } from "react-bootstrap";

const ProfileFeeds = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [feeds, setFeeds] = useState<Post[] | null>(null);
  const [radioValue, setRadioValue] = useState("1");
  const [checkContent, setCheckContent] = useState<boolean>(false);
  const [filteredFeeds, setFilteredFeeds] = useState<Post[]>([]);

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await getPosts();
        setFeeds(res);
      } catch (e) {
        console.error(e);
      }
    }
    fetchData();
  }, []);

  const handleClickCard = (id: string) => {
    console.log(id);
    navigate(`/content/${id}`);
  };

  useEffect(() => {
    if (feeds) {
      // Filter feeds based on the condition and update the state
      const newFilteredFeeds = feeds.filter((f) => f.user._id === id);
      setFilteredFeeds(newFilteredFeeds);
    }
  }, [feeds, id]);

  return (
    <div className="blogs">
      <section className="trending-post" id="trending">
        <div className="blog">
          {filteredFeeds &&
            filteredFeeds.map((feed, idx) => (
              <div
                className="row"
                key={idx}
                onClick={() => handleClickCard(feed._id)}
              >
                <img src={feed.image} alt="" />
                <div className="heart-icon">
                  <IoIosHeartEmpty
                    className="icon-heart"
                    style={{ marginRight: "10px" }}
                  />
                  <p>{feed.likes.length} likes</p>
                  <IoBookmarkOutline className="save-icon" />
                </div>
              </div>
            ))}
        </div>
      </section>
    </div>
  );
};

export default ProfileFeeds;
