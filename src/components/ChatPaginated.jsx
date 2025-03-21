import { useChatStore } from "../store/useChatStore";
import { useEffect, useRef, useState } from "react";
import { useInfiniteQuery } from "@tanstack/react-query";

import { useInView } from "react-intersection-observer";

import ChatHeader from "./ChatHeader";
import MessageInput from "./MessageInput";
import MessageSkeleton from "./skeletons/MessageSkeleton";
import { useAuthStore } from "../store/useAuthStore";
import { formatMessageTime } from "../lib/utils";

const ChatContainer = () => {
  const {
    messages,
    getMessages,
    isMessagesLoading,
    selectedUser,
    subscribeToMessages,
    unsubscribeFromMessages,
  } = useChatStore();
  const { authUser } = useAuthStore();

  const { data, error, status, fetchNextPage, isFetchingNextPage } =
    useInfiniteQuery({
      queryKey: ["messages", selectedUser?._id],
      queryFn: ({ pageParam = 0 }) =>
        getMessages({ userId: selectedUser._id, pageParam }),
      initialPageParam: 0,
      getNextPageParam: (lastPage) => lastPage.nextPage,
    });
  const messageEndRef = useRef(null);
  const [waitNewMessage, setWaitNewMessage] = useState(true);
  const { ref: topRef, inView: topInView } = useInView();
  const { ref: refBottom, inView: bottomInView } = useInView();

  useEffect(() => {
    subscribeToMessages();

    return () => unsubscribeFromMessages();
  }, [selectedUser, messages]);

  useEffect(() => {
    console.log(topInView, bottomInView);

    if (messageEndRef.current && topInView && !bottomInView && waitNewMessage) {
      console.log("sta je sad problem");
      setWaitNewMessage(false);
      messageEndRef.current.scrollIntoView({ behavior: "auto" });
    } else if (messageEndRef.current && topInView && !bottomInView) {
      // fetchNextPage();
      console.log(topInView, bottomInView);
      console.log("first");

      const container = messagesContainerRef.current;
      const previousScrollHeight = container?.scrollHeight;

      fetchNextPage().then(() => {
        requestAnimationFrame(() => {
          if (container) {
            const newScrollHeight = container.scrollHeight;
            container.scrollTop += newScrollHeight - previousScrollHeight;
          }
        });
      });
    }
  }, [
    fetchNextPage,
    topInView,
    bottomInView,
    subscribeToMessages,
    unsubscribeFromMessages,
  ]);
  const messagesContainerRef = useRef(null);

  // useEffect(() => {
  //   if (topInView && !bottomInView) {
  //     // Save the current scroll position before fetching the next page
  //     const container = messagesContainerRef.current;
  //     const previousScrollHeight = container?.scrollHeight;

  //     fetchNextPage().then(() => {
  //       // Restore the scroll position after new messages load
  //       requestAnimationFrame(() => {
  //         if (container) {
  //           const newScrollHeight = container.scrollHeight;
  //           container.scrollTop += newScrollHeight - previousScrollHeight;
  //         }
  //       });
  //     });
  //   }
  // }, [topInView, bottomInView, fetchNextPage]);
  // if (isMessagesLoading) {
  //   return (
  //     <div className="flex-1 flex flex-col overflow-auto">
  //       <ChatHeader />
  //       <MessageSkeleton />
  //       <MessageInput />
  //     </div>
  //   );
  // }

  return status === "pending" ? (
    <div>Loading...</div>
  ) : status === "error" ? (
    <div>{error.message}</div>
  ) : (
    <div className="flex-1 flex flex-col overflow-auto">
      <ChatHeader />

      <div
        className="flex-1 overflow-y-auto p-4 space-y-4 "
        // onScroll={handleScroll}
        ref={messagesContainerRef}
      >
        <div ref={topRef} className={isFetchingNextPage ? "hidden" : "block"}>
          {isFetchingNextPage && "Loading..."}
          ??
        </div>
        {data.pages
          .slice()
          .reverse()
          .map((page, index) => {
            return (
              <div key={index} className="flex flex-col gap-2 ">
                {page.data.map((message, index) => {
                  return (
                    <div
                      key={message._id}
                      className={`chat ${
                        message.senderId === authUser._id
                          ? "chat-end"
                          : "chat-start"
                      }`}
                      ref={messageEndRef}
                    >
                      <div className="chat-image avatar">
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
                      <div className="chat-bubble flex flex-col flex-wrap">
                        {message.image && (
                          <img
                            src={message.image}
                            alt="Attachment"
                            className="sm:max-w-[200px] rounded-md mb-2"
                          />
                        )}
                        {/* to do: break words */}
                        {message.text && (
                          <p className="break-words ">{message.text}</p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            );
          })}
        <div ref={refBottom}>------------</div>
      </div>

      <MessageInput />
    </div>
  );
};

export default ChatContainer;
