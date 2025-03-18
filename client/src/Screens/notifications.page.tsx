import { useContext, useEffect, useState } from "react";
import { UserContext } from "../App";
import axios from "axios";
import { filterPaginationData } from "../components/filter-pagination";
import Loader from "../components/loader.component";
import AnimationWrapper from "./page-animation";
import NoDataMessage from "../components/nodata.component";
import NotificationCard from "../components/notification-card.component";
import LoadMoreDataBtn from "../components/load-more.component";

interface NotificationData {
  id: string;
  type: string;
  createdAt: string;
}

interface NotificationsResponse {
  result: NotificationData[];
  deletedDoccount?: number;
}

const Notification = () => {
  let {
    userAuth: { access_token },
  } = useContext(UserContext);
  const [filter, setFilter] = useState("all");
  const [notifications, setNotifications] =
    useState<NotificationsResponse | null>(null);
  let filters = ["all", "like", "comment", "reply", "follow", "system"];

  const fetchNotifications = ({
    page,
    deletedDoccount = 0,
  }: {
    page: number;
    deletedDoccount?: number;
  }) => {
    axios
      .post(
        `${process.env.REACT_APP_API_ENDPOINT}/notifications/notifications`,
        { page,  filter: filter !== "system" ? filter : "delete", deletedDoccount },
        {
          headers: {
            Authorization: `Bearer ${access_token}`,
          },
        }
      )
      .then(async ({ data: { notifications: data } }) => {
        console.log(data);
        let formatedData = await filterPaginationData({
          state: notifications,
          data,
          page,
          countRoute: "/notifications/all-notification-count",
          data_to_send:  filter!="system" ? filter : "delete" ,
          user: access_token ?? undefined,
        });
        setNotifications(formatedData);
        console.log(formatedData);
      })
      .catch((err) => {
        console.log(err);
      });
  };

  useEffect(() => {
    if (access_token) {
      fetchNotifications({ page: 1 });
    }
  }, [access_token, filter]);

  const handleFilter = (e: React.MouseEvent<HTMLButtonElement>) => {
    let btn = e.target as HTMLButtonElement;
    setFilter(btn.innerHTML);
    setNotifications(null);
  };
  return (
    <div>
      <h1 className="md:hidden fs-5">การแจ้งเตือนล่าสุด</h1>

      <div className="my-4 d-flex gap-4">
        {filters.map((filterName, i) => {
          return (
            <button
              key={i}
              className={
                "py-2 " + (filter === filterName ? "btn-dark" : "btn-light")
              }
              onClick={handleFilter}
            >
              {filterName}
            </button>
          );
        })}
      </div>
      {notifications === null ? (
        <Loader />
      ) : (
        <>
          {notifications.result.length ? (
            notifications.result.map((notification, i) => {
              return (
                <AnimationWrapper key={i} transition={{ delay: i * 0.08 }}>
                  <NotificationCard
                    data={notification}
                    index={i}
                    notificationState={{ notifications, setNotifications }}
                  />
                </AnimationWrapper>
              );
            })
          ) : (
            <NoDataMessage message="ไม่มีข้อมูล" />
          )}
          <LoadMoreDataBtn
            state={notifications}
            fetchDataFun={fetchNotifications}
            additionalParam={{ deletedDoccount: notifications.deletedDoccount }}
          />
        </>
      )}
    </div>
  );
};

export default Notification;
