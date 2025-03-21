import { create } from "zustand";
import { axiosInstance } from "../lib/axios";
import toast from "react-hot-toast";
import { useAuthStore } from "./useAuthStore";

export const useChatStore = create((set, get)=>({
    messages:[],
    users: [],
    selectedUser: null,
    isUsersLoading: false,
    isMessagesLoading: false,
    hasMoreMessages: true,
    getUsers: async () => {
        set({ isUsersLoading: true });
        try {
            const res = await axiosInstance.get("/messages/users");
            set({ users: res.data });
        } catch (error) {
            toast.error(error.response.data.messages);
        } finally {
            set({ isUsersLoading: false });
        }
    },

    // getMessages: async (userId, numOfLastMessages) => {
    //     set({ isMessagesLoading: true });
    //     try {
    //         console.log("first")
    //         const res = await axiosInstance.get(`/messages/`, {
    //             params: {
    //                 id: userId,
    //                 last: numOfLastMessages
    //             }
    //         });
    //         set({ messages: res.data });
    //     } catch (error) {
    //         toast.error(error.response.data.messages);
    //     } finally {
    //         setTimeout(() => {
    //             set({ isMessagesLoading: false });
    //         }, 0);
           
    //     }
    // },

    getMessages: async (userId, numOfLastMessages) => {
        set({ isMessagesLoading: true });
        try {
            const res = await axiosInstance.get(`/messages/`, {
                params: {
                    id: userId,
                    last: numOfLastMessages
                }
            });
            set({ messages: res.data });
            set({
               
                hasMoreMessages: res.data.length === numOfLastMessages,
            });
        } catch (error) {
            toast.error(error.response?.data?.messages || "Error loading messages");
        } finally {
            set({ isMessagesLoading: false });
        }
    },

    // pagination
    // getMessages: async ({ userId, pageParam = 0 }) => {
    //     set({ isMessagesLoading: true });
    //     try {
    //       const res = await axiosInstance.get(`/messages/`, { 
    //             params: { 
    //                 id: userId, 
    //                 page: pageParam, 
    //                 limit: 10
    //             }
    //         });
    //         // console.log(res.data);
    //         // set({ messages: res.data });

    //       return res.data;
    //        // Ensure it returns { data, currentPage, nextPage }
    //     } catch (error) {
    //       toast.error(error.response?.data?.message || "Failed to load messages");
    //       return { data: [], currentPage: pageParam, nextPage: null }; // Ensure structure
    //     } finally {
    //       set({ isMessagesLoading: false });
    //     }
    //   },
    
    sendMessage: async (messageData) => {
        const { selectedUser, messages} = get();
        
        try {
            const res = await axiosInstance.post(`/messages/send/${selectedUser._id}`, messageData);
            set({ messages:[...messages, res.data]});
        } catch (error) {
            toast.error(error.response.data.messages);
        }
    },

    subscribeToMessages: () => {
        const {selectedUser } = get();
        if (!selectedUser) return;

        const socket = useAuthStore.getState().socket;

        
        socket.on("newMessage", (newMessage)=>{
            const isMessageSentFromSelectedUser = newMessage.senderId === selectedUser._id;

            if (!isMessageSentFromSelectedUser) return;
            set({messages: [...get().messages, newMessage]})
        })
    },

    unsubscribeFromMessages: ()=>{
        const socket = useAuthStore.getState().socket;
        socket.off("newMessage");
    },

    //todo: optimize this one later
    setSelectedUser: (selectedUser) => set({selectedUser}),


}))