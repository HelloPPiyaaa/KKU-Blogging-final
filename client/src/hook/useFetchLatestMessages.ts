import { useContext, useEffect, useState } from "react";
import { ChatContext } from "../Screens/ChatContext";
import { API_BASE_URL, getRequest } from "../api/chat";

interface Message {
  chatId: string;
  senderId: string;
  text: string;
  createdAt: string;
  deletedBy?: { [userId: string]: boolean };
}

export const useFetchLatestMessages = (chat: { _id: string }) => {
  const { newMessage, notifications, userId } = useContext(ChatContext); // Add userId here
  const [latestMessage, setLatestMessage] = useState<Message | null>(null);

  useEffect(() => {
    const getMessages = async () => {
      try {
        const response = await getRequest(
          `${API_BASE_URL}/messages/${chat._id}`
        );
        if (response.error) {
          console.error("Error getting message...", response.error);
          return;
        }

        // Filter out deleted messages
        const filteredMessages = response.filter(
          (msg: Message) => !(msg.deletedBy && userId && msg.deletedBy[userId])
        );

        const lastMessage = filteredMessages[filteredMessages.length - 1];
        setLatestMessage(lastMessage);
      } catch (error) {
        console.error("Error fetching messages:", error);
      }
    };

    getMessages();
  }, [chat._id, newMessage, notifications, userId]); // Add userId to dependencies

  return { latestMessage };
};
