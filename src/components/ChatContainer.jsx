import { useChatStore } from "../store/useChatStore";
import { useEffect, useRef, useState } from "react";

import ChatHeader from "./ChatHeader";
import MessageInput from "./MessageInput";
import MessageSkeleton from "./skeletons/MessageSkeleton";
import { useAuthStore } from "../store/useAuthStore";
import { formatMessageTime } from "../lib/utils";
import { useInView } from "react-intersection-observer";

const ChatContainer = () => {
  const {
    messages,
    getMessages,
    isMessagesLoading,
    selectedUser,
    subscribeToMessages,
    unsubscribeFromMessages,
    hasMoreMessages,
  } = useChatStore();
  const { authUser } = useAuthStore();
  const messageEndRef = useRef(null);
  const messagesContainerRef = useRef(null);
  const [numOfLastMessages, setNumOfLastMessages] = useState(10);
  const { ref: topRef, inView: topInView } = useInView();
  const { ref: bottomRef, inView: bottomInView } = useInView();

  useEffect(() => {
    getMessages(selectedUser._id, numOfLastMessages);
    setNumOfLastMessages((prev) => prev + 10);

    subscribeToMessages();

    return () => unsubscribeFromMessages();
  }, [
    selectedUser._id,
    getMessages,
    subscribeToMessages,
    unsubscribeFromMessages,
  ]);

  useEffect(() => {
    if (messageEndRef.current && messages && bottomInView) {
      messageEndRef.current.scrollIntoView({ behavior: "auto" });
    }
  }, [messages]);

  // useEffect(() => {
  //   if (topInView && !isMessagesLoading) {
  //     const container = messagesContainerRef.current;
  //     const previousScrollHeight = container?.scrollHeight;

  //     getMessages(selectedUser._id, numOfLastMessages).then(() => {
  //       requestAnimationFrame(() => {
  //         if (container) {
  //           const newScrollHeight = container.scrollHeight;
  //           container.scrollTop += newScrollHeight - previousScrollHeight;
  //         }
  //       });
  //     });
  //     setNumOfLastMessages((prev) => prev + 10);
  //   }
  // }, [topInView, isMessagesLoading, getMessages, selectedUser._id]);

  useEffect(() => {
    if (topInView && !isMessagesLoading && hasMoreMessages) {
      const container = messagesContainerRef.current;
      const previousScrollHeight = container?.scrollHeight;

      getMessages(selectedUser._id, numOfLastMessages).then(() => {
        requestAnimationFrame(() => {
          if (container) {
            const newScrollHeight = container.scrollHeight;
            container.scrollTop += newScrollHeight - previousScrollHeight;
          }
        });
      });
      setNumOfLastMessages((prev) => prev + 10);
    }
  }, [
    topInView,
    isMessagesLoading,
    getMessages,
    selectedUser._id,
    hasMoreMessages,
  ]);
  return (
    <div className="flex-1 flex flex-col overflow-auto">
      <ChatHeader />

      <div
        ref={messagesContainerRef}
        className="flex-1 overflow-y-auto p-4 space-y-4"
      >
        {/* <div ref={topRef} className={isMessagesLoading ? "hidden" : "block"}>
          {isMessagesLoading && "Loading..."}
          ??
        </div> */}
        <div ref={topRef} className={isMessagesLoading ? "hidden" : "block"}>
          {isMessagesLoading
            ? "Loading..."
            : hasMoreMessages
            ? ""
            : "No more messages to load"}
        </div>
        {messages.map((message) => (
          <div
            key={message._id}
            className={`chat ${
              message.senderId === authUser._id ? "chat-end" : "chat-start"
            }`}
            ref={messageEndRef}
          >
            <div className=" chat-image avatar">
              <div className="size-10 rounded-full border">
                <img
                  src={
                    message.senderId === authUser._id
                      ? authUser.profilePic || "/avatar.png"
                      : selectedUser.profilePic || "/avatar.png"
                  }
                  alt="profile pic"
                />
              </div>
            </div>
            <div className="chat-header mb-1">
              <time className="text-xs opacity-50 ml-1">
                {formatMessageTime(message.createdAt)}
              </time>
            </div>
            <div className="chat-bubble flex flex-col">
              {message.image && (
                <img
                  src={message.image}
                  alt="Attachment"
                  className="sm:max-w-[200px] rounded-md mb-2"
                />
              )}
              {message.text && (
                <p className="break-words brake-all">{message.text}</p>
              )}
            </div>
          </div>
        ))}
        <div ref={bottomRef}>----</div>
      </div>

      <MessageInput />
    </div>
  );
};
export default ChatContainer;
