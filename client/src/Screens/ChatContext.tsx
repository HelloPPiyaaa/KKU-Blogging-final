import {
  createContext,
  useState,
  useEffect,
  ReactNode,
  useCallback,
  Dispatch,
  SetStateAction
} from "react";
import { getRequest, API_BASE_URL, postRequest } from "../api/chat";
import { io, Socket } from "socket.io-client";
import ChatBox from "../Navbar/chat/ChatBox";

interface User {
  _id: string;
  firstname: string;
  profile_picture?: string;
}

interface Chat {
  _id: string;
  members: string[];
  deletedBy?: Map<string, boolean>;
  messages: Message[];
}

interface Message {
  chatId: string;
  senderId: string;
  text: string;
  createdAt: string;
  deletedBy?: { [userId: string]: boolean };
}

interface Notification {
  senderId: string;
  chatId: string;
  text: string;
  isRead: boolean;
  createdAt: string;
}

interface ChatContextProps {
  userChats: Chat[];
  isUserChatsLoading: boolean;
  UserChatsError: any;
  userId: string | null;
  potentialChats: User[];
  createChat: (firstId: string, secondId: string) => Promise<void>;
  updateCurrentChat: (chat: Chat) => void;
  currentChat: Chat | null;
  messages: any[];
  isMessagesLoading: boolean;
  messagesError: any;
  sendTextMessage: (
    textMessage: string,
    sender: User,
    currentChatId: string,
    setTextMessage: Dispatch<SetStateAction<string>>
  ) => Promise<void>;
  onlineUsers: any[];
  notifications: Notification[];
  allUsers: User[];
  markAllNotificationsAsRead: (notifications: Notification[]) => void;
  markNotificationAsRead: (
    n: Notification,
    userChats: Chat[],
    user: User,
    notifications: Notification[]
  ) => void;
  toggleChatBox: () => void;
  markThisUserNotificationsAsRead: (
    thisUserNotifications: Notification[],
    notifications: Notification[]
  ) => void;
  newMessage: Message | null;
  isChatBoxOpen: boolean;
  setIsChatBoxOpen: (isOpen: boolean) => void;
  deleteChat: (chatId: string, userId: string) => Promise<void>;
  getUserChats: () => void;
}

interface ChatContextProviderProps {
  children: ReactNode;
}

const defaultChatContext: ChatContextProps = {
  userChats: [],
  isUserChatsLoading: false,
  UserChatsError: null,
  userId: null,
  potentialChats: [],
  createChat: async (firstId: string, secondId: string) => {},
  updateCurrentChat: () => {},
  currentChat: null,
  messages: [],
  isMessagesLoading: false,
  messagesError: null,
  sendTextMessage: async () => {},
  onlineUsers: [],
  notifications: [],
  allUsers: [],
  markAllNotificationsAsRead: () => {},
  markNotificationAsRead: () => {},
  toggleChatBox: () => {},
  markThisUserNotificationsAsRead: () => {},
  newMessage: null,
  isChatBoxOpen: false,
  setIsChatBoxOpen: () => {},
  deleteChat: async (chatId: string, userId: string) => {},
  getUserChats: () => {}
};

export const ChatContext = createContext<ChatContextProps>(defaultChatContext);

export const ChatContextProvider: React.FC<ChatContextProviderProps> = ({ children }) => {
  const [userChats, setUserChats] = useState<Chat[]>([]);
  const [isUserChatsLoading, setUserChatsLoading] = useState<boolean>(false);
  const [UserChatsError, setUserChatsError] = useState<any>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [potentialChats, setPotentialChats] = useState<User[]>([]);
  const [currentChat, setCurrentChat] = useState<Chat | null>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [isMessagesLoading, setIsMessageLoading] = useState<boolean>(false);
  const [messagesError, setMessagesError] = useState<any>(null);
  const [sendTextMessageError, setSendTextMessageError] = useState(null);
  const [newMessage, setNewMessage] = useState<Message | null>(null);
  const [socket, setSocket] = useState<Socket | null>(null);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [isChatBoxOpen, setIsChatBoxOpen] = useState(defaultChatContext.isChatBoxOpen);

  useEffect(() => {
    const storedUserId = sessionStorage.getItem("userId");
    if (storedUserId) {
      setUserId(storedUserId);
    }
  }, []);

  const toggleChatBox = () => {
    setIsChatBoxOpen((prev) => !prev);
  };

  useEffect(() => {
    const newSocket = io(
      process.env.SOCKET_ENDPOINT || "https://kku-socket.onrender.com"
      // "https://kku-blog-server-ak2l.onrender.com" ||
      // "https://kku-for-deploy.onrender.com"
    );
    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, [userId]);

  // add online users
  useEffect(() => {
    if (socket === null) return;
    socket?.emit("addNewUser", userId);
    socket.on("getOnlineUsers", (res) => {
      setOnlineUsers(res);
    });

    return () => {
      socket.off("getOnlineUsers");
    };
  }, [socket, userId]);

  //ส่งข้อความ
  useEffect(() => {
    if (socket === null) return;

    const recipientId = currentChat?.members.find((id) => id !== userId);
    socket.emit("sendMessage", { ...newMessage, recipientId });
  }, [newMessage]);

  //รับข้อความ และแจ้งเตือน
  useEffect(() => {
    if (socket === null) return;

    socket.on("getMessage", (res) => {
      if (currentChat?._id !== res.chatId) return;

      setMessages((prev) => [...prev, res]);
    });

    socket.on("getNotification", (res) => {
      console.log("Received notification:", res);
      const isChatOpen = currentChat?.members.some((id) => id === res.senderId);

      if (isChatOpen) {
        setNotifications((prev) => [{ ...res, isRead: true }, ...prev]);
      } else {
        setNotifications((prev) => [res, ...prev]);
      }
    });

    return () => {
      socket.off("getMessage");
      socket.off("getNotification");
    };
  }, [socket, currentChat]);

  // useEffect(() => {
  //   const storedUserId = localStorage.getItem("userId");
  //   if (storedUserId) {
  //     setUserId(storedUserId);
  //   }
  // }, []);

  useEffect(() => {
    console.log("Notifications in ChatContext:", notifications);
  }, [notifications]);

  useEffect(() => {
    const getUsers = async () => {
      const response = await getRequest(`${API_BASE_URL}/users`);

      if (response.error) {
        return console.log("Error fetching users", response);
      }

      const pChats = response.filter((u: User) => {
        let isChatCreated = false;

        if (userId === u._id) return false;

        if (userChats) {
          isChatCreated = userChats.some((chat) => {
            return chat.members.includes(u._id);
          });
        }
        return !isChatCreated;
      });

      setPotentialChats(pChats);
      setAllUsers(response);
    };
    getUsers();
  }, [userChats, userId]);

  const getUserChats = async () => {
    if (userId) {
      setUserChatsLoading(true);
      setUserChatsError(null);

      try {
        const response = await getRequest(`${API_BASE_URL}/chats/${userId}`);
        setUserChatsLoading(false);

        if (response.error) {
          setUserChatsError(response.error);
          return;
        }

        if (Array.isArray(response)) {
          // กรองแชทที่ถูกลบสำหรับผู้ใช้
          const filteredChats = response.filter(
            (chat: Chat) => !(chat.deletedBy instanceof Map && chat.deletedBy.get(userId) === true)
          );

          setUserChats(filteredChats);
        } else {
          console.error("Unexpected response format:", response);
        }
      } catch (error) {
        setUserChatsLoading(false);
        setUserChatsError({ message: error });
        console.error("Error fetching user chats:", error);
      }
    }
  };

  useEffect(() => {
    getUserChats();
  }, [userId, notifications]);

  useEffect(() => {
    const getMessages = async () => {
      if (!currentChat?._id || !userId) return; // ตรวจสอบว่า userId ไม่เป็น null

      setIsMessageLoading(true);
      setMessagesError(null);

      try {
        const response = await getRequest(`${API_BASE_URL}/messages/${currentChat._id}`);
        setIsMessageLoading(false);

        if (response.error) {
          setMessagesError(response);
          return;
        }

        // กรองข้อความที่ถูกลบ
        const filteredMessages = response.filter(
          (msg: Message) => !(msg.deletedBy && userId && msg.deletedBy[userId]) // ตรวจสอบว่า userId ไม่เป็น null
        );
        setMessages(filteredMessages);
      } catch (error) {
        setIsMessageLoading(false);
        setMessagesError(error);
      }
    };

    getMessages();
  }, [currentChat, userId]);

  const sendTextMessage = useCallback(
    async (
      textMessage: string,
      sender: User,
      currentChatId: string,
      setTextMessage: React.Dispatch<React.SetStateAction<string>>
    ) => {
      if (!textMessage) return console.log("คุณต้องพิมพ์อะไรบางอย่าง...");

      const response = await postRequest(
        `${API_BASE_URL}/messages`,
        JSON.stringify({
          chatId: currentChatId,
          senderId: sender._id,
          text: textMessage
        })
      );

      if (response.error) {
        return setSendTextMessageError(response);
      }

      setNewMessage(response);
      setMessages((prev) => [...prev, response]);
      setTextMessage("");
    },
    []
  );

  const updateCurrentChat = useCallback((chat: Chat) => {
    setCurrentChat(chat);
  }, []);

  const createChat = async (firstId: string, secondId: string) => {
    if (!firstId || typeof firstId !== "string" || typeof secondId !== "string") {
      console.error("Invalid IDs provided:", firstId, secondId);
      return;
    }

    console.log("Creating chat between:", firstId, secondId);
    const response = await postRequest(
      `${API_BASE_URL}/chats`,
      JSON.stringify({ firstId, secondId })
    );

    if (response.error) {
      console.error("Error Creating Chat", response);
    } else {
      console.log("Chat created successfully:", response);

      // ตรวจสอบการเพิ่มแชทใหม่ใน state
      setUserChats((prev) => [...prev, response]);
    }
  };

  const markAllNotificationsAsRead = useCallback((notifications: Notification[]) => {
    const mNotifications = notifications.map((n: Notification) => {
      return { ...n, isRead: true };
    });

    setNotifications(mNotifications);
  }, []);

  const markNotificationAsRead = useCallback(
    (n: Notification, userChats: Chat[], user: User, notifications: Notification[]) => {
      // ค้นหาแชทเพื่อเปิด
      const desiredChat = userChats.find((chat) => {
        const ChatMembers = [user._id, n.senderId];
        const isDesiredChat = chat?.members.every((member) => ChatMembers.includes(member));
        return isDesiredChat;
      });

      // ทำเครื่องหมายแจ้งเตือนว่าอ่านแล้ว
      const mNotifications = notifications.map((el) => {
        if (n.senderId === el.senderId) {
          return { ...n, isRead: true };
        } else {
          return el;
        }
      });

      if (desiredChat) {
        updateCurrentChat(desiredChat);
      }

      setNotifications(mNotifications);
    },
    [updateCurrentChat, setNotifications]
  );

  const markThisUserNotificationsAsRead = useCallback(
    (thisUserNotifications: Notification[], notifications: Notification[]) => {
      const mNotifications = notifications.map((el) => {
        const isReadNotification = thisUserNotifications.some((n) => n.senderId === el.senderId);
        return isReadNotification ? { ...el, isRead: true } : el;
      });
      setNotifications(mNotifications);
    },
    [setNotifications]
  );

  const deleteChat = useCallback(async (chatId: string, userId: string) => {
    try {
      // ส่งคำขอไปที่ API เพื่อทำเครื่องหมายว่าแชทถูกลบ
      const response = await fetch(`${API_BASE_URL}/chats/delete`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ chatId, userId })
      });

      if (!response.ok) {
        throw new Error("Failed to delete chat");
      }

      // อัปเดต state ของ userChats
      setUserChats((prevChats) => {
        console.log("Before update:", prevChats);

        const updatedChats = prevChats
          .map((chat) =>
            chat._id === chatId
              ? {
                  ...chat,
                  deletedBy: new Map([
                    ...(chat.deletedBy ? Array.from(chat.deletedBy) : []),
                    [userId, true]
                  ])
                }
              : chat
          )
          .filter(
            (chat) => !(chat.deletedBy instanceof Map && chat.deletedBy.get(userId) === true)
          );

        console.log("After update:", updatedChats);

        return updatedChats;
      });

      // ส่งคำขอไปที่ API เพื่อทำเครื่องหมายว่าข้อความในแชทถูกลบ
      await fetch(`${API_BASE_URL}/messages/delete`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ chatId, userId })
      });

      // อัปเดตข้อความของแชทเพื่อกรองข้อความที่ถูกลบ
      setMessages((prevMessages) => {
        console.log("Before message filter:", prevMessages);

        const filteredMessages = prevMessages.filter(
          (msg) => !(msg.chatId === chatId && msg.deletedBy === userId)
        );

        console.log("After message filter:", filteredMessages);

        return filteredMessages;
      });
    } catch (error) {
      console.error("Error deleting chat:", error);
    }
  }, []);

  return (
    <ChatContext.Provider
      value={{
        userChats,
        isUserChatsLoading,
        UserChatsError,
        userId,
        potentialChats,
        createChat,
        updateCurrentChat,
        currentChat,
        messages,
        isMessagesLoading,
        messagesError,
        sendTextMessage,
        onlineUsers,
        notifications,
        allUsers,
        markAllNotificationsAsRead,
        markNotificationAsRead,
        toggleChatBox,
        markThisUserNotificationsAsRead,
        newMessage,
        isChatBoxOpen,
        setIsChatBoxOpen,
        deleteChat,
        getUserChats
      }}
    >
      {children}
      {isChatBoxOpen && <ChatBox />}
    </ChatContext.Provider>
  );
};
