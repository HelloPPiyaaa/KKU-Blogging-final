// src/Screens/Chat.tsx

import { useContext, useEffect } from "react";
import { ChatContext } from "./ChatContext";
import { Container, Stack } from "react-bootstrap";
import Userchat from "../Navbar/chat/UserChat";
import Potentialchats from "../Navbar/chat/Potentialchats";
import ChatBox from "../Navbar/chat/ChatBox";

const Chat = () => {
  const { userChats, isUserChatsLoading, updateCurrentChat, userId } = useContext(ChatContext);

  useEffect(() => {
    console.log("Updated userChats", userChats);
  }, [userChats]);

  return (
    <Container>
      <Potentialchats />
      {userChats.length > 0 && (
        <Stack direction="horizontal" gap={4} className="align-items-start">
          <Stack className="messages-box flex-grow-0 pe-3">
            {isUserChatsLoading && <p>Loading chats...</p>}
            {userChats.map((chat, index) => (
              <div key={index} onClick={() => updateCurrentChat(chat)}>
                <Userchat chat={chat} userId={userId || ""} />
              </div>
            ))}
          </Stack>
          <ChatBox />
        </Stack>
      )}
    </Container>
  );
};

export default Chat;
