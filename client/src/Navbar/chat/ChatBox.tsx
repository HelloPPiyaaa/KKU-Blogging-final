import { useContext, useState, useRef, useEffect } from "react";
import { ChatContext } from "../../Screens/ChatContext";
import { useFetchRecipientUser } from "../../hook/useFetchRecipient";
import { Stack } from "react-bootstrap";
import moment from "moment";
import InputEmoji from "react-input-emoji";
import { IoIosSend } from "react-icons/io";
import { IoCloseOutline } from "react-icons/io5";

const ChatBox = () => {
  const {
    currentChat,
    messages,
    isMessagesLoading,
    userId,
    sendTextMessage,
    isChatBoxOpen,
    setIsChatBoxOpen
  } = useContext(ChatContext);
  const { recipientUser } = useFetchRecipientUser(currentChat, userId);
  const [textMessage, setTextMessage] = useState("");
  const scroll = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    scroll.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  if (isMessagesLoading)
    return <p style={{ textAlign: "center", width: "100%" }}>Loading Chat...</p>;

  const handleSendMessage = () => {
    if (!userId) return;
    sendTextMessage(
      textMessage,
      { _id: userId, firstname: "" },
      currentChat?._id ?? "",
      setTextMessage
    );
  };

  const handleClose = () => {
    setIsChatBoxOpen(false);
  };

  return isChatBoxOpen ? (
    <Stack gap={4} className="chat-box">
      <div className="chat-header">
        <strong>{recipientUser?.username}</strong>
        <span onClick={handleClose}>
          <IoCloseOutline />
        </span>
      </div>
      <Stack gap={3} className="messages">
        {messages &&
          messages.map((message1, index) => (
            <Stack
              key={index}
              className={`${
                message1?.senderId === userId
                  ? "message self align-self-end flex-grow-0"
                  : "message1 align-self-start flex-grow-0"
              }`}
              ref={scroll}
            >
              <span className="text">{message1.text}</span>
              <span className="message-footer">{moment(message1.createdAt).calendar()}</span>
            </Stack>
          ))}
      </Stack>
      <Stack direction="horizontal" gap={3} className="chat-input flex-grow-0">
        <InputEmoji
          value={textMessage}
          onChange={setTextMessage}
          fontFamily="Poppins"
          borderColor="rgba(72, 112, 223, 0.2)"
          shouldReturn={true}
          shouldConvertEmojiToImage={false}
        />
        <button className="send-btn" onClick={handleSendMessage}>
          <IoIosSend />
        </button>
      </Stack>
    </Stack>
  ) : null;
};

export default ChatBox;
