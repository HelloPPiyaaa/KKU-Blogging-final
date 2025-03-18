import React, { useContext, useState } from "react";
import { useFetchRecipientUser } from "../../hook/useFetchRecipient";
import { Stack } from "react-bootstrap";
import "../../misc/Userchat.css";
import avarter from "../../pic/bg1.png";
import { ChatContext } from "../../Screens/ChatContext";
import { useFetchLatestMessages } from "../../hook/useFetchLatestMessages";
import moment from "moment";
import { TbDotsVertical } from "react-icons/tb";
import { MdDelete } from "react-icons/md";
import "../../misc/Userchat.css";

interface Chat {
  _id: string;
  members: string[];
}

interface UserchatProps {
  chat: Chat;
  userId: string;
}

interface Notification {
  senderId: string;
  chatId: string;
  text: string;
  isRead: boolean;
  createdAt: string;
}

const Userchat: React.FC<UserchatProps> = ({ chat, userId }) => {
  const { recipientUser, error } = useFetchRecipientUser(chat, userId);
  const { onlineUsers, notifications, markThisUserNotificationsAsRead, deleteChat } =
    useContext(ChatContext);
  const { latestMessage } = useFetchLatestMessages(chat);
  const [isOpen, setIsOpen] = useState(false);

  const unreadNotifications = (notifications: Notification[]): Notification[] => {
    return notifications.filter((notification) => !notification.isRead);
  };

  const allUnreadNotifications = unreadNotifications(notifications);

  const thisUserNotifications = allUnreadNotifications.filter(
    (n) => n.senderId === recipientUser?._id
  );
  const isOnline = onlineUsers?.some((user) => user?.userId === recipientUser?._id);

  const truncateText = (text: string) => {
    let shortText = text.substring(0, 20);
    if (text.length > 20) {
      shortText = shortText + "...";
    }
    return shortText;
  };

  const toggleMenu = (e: React.MouseEvent) => {
    e.stopPropagation(); // หยุดการแพร่กระจายของ event
    setIsOpen(!isOpen);
  };

  const handleDeleteChat = async () => {
    try {
      await deleteChat(chat._id, userId);
      setIsOpen(false);
    } catch (error) {
      console.error("Error deleting chat:", error);
    }
  };

  return (
    <Stack
      direction="horizontal"
      gap={3}
      className="user-card align-items-center p-2 justify-content-between"
      role="button"
      onClick={() => {
        if (thisUserNotifications?.length !== 0) {
          markThisUserNotificationsAsRead(thisUserNotifications, notifications);
        }
      }}
    >
      <div className="d-flex">
        <div className="me-2">
          <img src={recipientUser?.profile_picture} alt="avatar" height="35px" />
        </div>

        <div className="text-content">
          <div className="name">{recipientUser?.username}</div>
          <div className="text d-flex">
            {latestMessage?.text && (
              <span style={{ paddingRight: "10px" }}>{truncateText(latestMessage?.text)}</span>
            )}
            <div className="date">{moment(latestMessage?.createdAt).calendar()}</div>
          </div>
        </div>
        
      </div>

      <div className="align-items-end">
        <div className={thisUserNotifications?.length > 0 ? "this-user-notifications" : ""}>
          {thisUserNotifications?.length > 0 ? thisUserNotifications?.length : ""}
        </div>
        <span className={isOnline ? "user-online" : ""}></span>
        <div className="other-icon">
          <TbDotsVertical onClick={toggleMenu} />
          {isOpen && (
            <div className="dropdown-item2">
              <ul>
                <li onClick={handleDeleteChat}>
                  <MdDelete />
                  <a href="#">ลบ</a>
                </li>
              </ul>
            </div>
          )}
        </div>
      </div>
    </Stack>
  );
};

export default Userchat;
