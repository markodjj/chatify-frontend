import { useInfiniteQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import { useInView } from "react-intersection-observer";

import "./App.css";
import { useChatStore } from "../store/useChatStore";
const Chat = () => {
  const {
    messages,
    getMessages,
    isMessagesLoading,
    selectedUser,
    subscribeToMessages,
    unsubscribeFromMessages,
  } = useChatStore();

  const { data, error, status, fetchNextPage, isFetchingNextPage } =
    useInfiniteQuery({
      queryKey: ["messages", selectedUser?._id], // Ensure unique key per user
      queryFn: ({ pageParam = 0 }) =>
        getMessages({ userId: selectedUser._id, pageParam }),
      initialPageParam: 0,
      getNextPageParam: (lastPage) => lastPage.nextPage, // Properly set next page
    });

  const { ref, inView } = useInView();

  useEffect(() => {
    if (inView) {
      fetchNextPage();
    }
  }, [fetchNextPage, inView]);

  return status === "pending" ? (
    <div>Loading...</div>
  ) : status === "error" ? (
    <div>{error.message}</div>
  ) : (
    <div className="flex flex-col gap-2 big">
      {data.pages.map((page, index) => {
        return (
          <div key={index} className="flex flex-col gap-2 ">
            {page.data.map((item, index) => {
              return (
                <div key={index} className="rounded-md bg-grayscale-700 p-4">
                  {item.text}
                </div>
              );
            })}
          </div>
        );
      })}

      <div ref={ref}>{isFetchingNextPage && "Loading..."}</div>
    </div>
  );
};

export default Chat;
