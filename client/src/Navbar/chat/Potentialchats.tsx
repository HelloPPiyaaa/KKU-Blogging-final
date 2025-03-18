import { useEffect, useContext } from "react";
import { ChatContext } from "../../Screens/ChatContext";

const PotentialChats = () => {
  const { potentialChats, createChat, userId, onlineUsers } = useContext(ChatContext);

  const handleClick = (event: React.MouseEvent<HTMLDivElement>, secondId: string) => {
    event.stopPropagation();

    if (userId) {
      createChat(userId, secondId);
    } else {
      console.error("User ID is null");
    }
  };

  return (
    
    <div className="all-users">
    
      {potentialChats &&
        potentialChats.map((u, index) => (
          
            <span
              className={onlineUsers?.some((user) => user?.userId === u?._id) ? "user-online" : ""}
            ></span>
        
        ))}
    </div>
  );
};

export default PotentialChats;
