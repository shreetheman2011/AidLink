// pages/dashboard/my-chats.js
import { useEffect, useState, useRef } from "react";
import { auth, db } from "../../firebase";
import { onAuthStateChanged } from "firebase/auth";
import {
  collection,
  query,
  where,
  onSnapshot,
  orderBy,
  addDoc,
  serverTimestamp,
} from "firebase/firestore";
import SidebarLayout from "../../components/SidebarLayout";

export default function MyChats() {
  const [user, setUser] = useState(null);
  const [chats, setChats] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState("");
  const [unreadCounts, setUnreadCounts] = useState({});
  const messagesEndRef = useRef(null);

  // Check user auth
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      if (u) {
        setUser(u);
      } else {
        window.location.href = "/";
      }
    });
    return () => unsubscribe();
  }, []);

  // Request Notification permission
  useEffect(() => {
    if ("Notification" in window && Notification.permission !== "granted") {
      Notification.requestPermission();
    }
  }, []);

  // Fetch chats where user is a participant
  useEffect(() => {
    if (!user) return;

    const chatsRef = collection(db, "chats");
    const q = query(
      chatsRef,
      where("participants", "array-contains", user.email)
    );
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const chatData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setChats(chatData);
      if (!selectedChat && chatData.length > 0) {
        setSelectedChat(chatData[0]);
      }
    });

    return () => unsubscribe();
  }, [user, selectedChat]);

  // Fetch messages for selected chat
  useEffect(() => {
    if (!selectedChat || !user) return;

    const messagesRef = collection(db, "chats", selectedChat.id, "messages");
    const q = query(messagesRef, orderBy("timestamp", "asc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const msgs = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      // Check for new messages for notification & unread count
      if (msgs.length > messages.length) {
        const newMsg = msgs[msgs.length - 1];
        if (
          newMsg.sender !== user.email &&
          selectedChat?.id !== selectedChat.id
        ) {
          if (
            "Notification" in window &&
            Notification.permission === "granted"
          ) {
            new Notification(`New message from ${newMsg.sender}`, {
              body: newMsg.text,
            });
          }
          setUnreadCounts((prev) => ({
            ...prev,
            [selectedChat.id]: (prev[selectedChat.id] || 0) + 1,
          }));
        }
      }

      setMessages(msgs);
    });

    // Reset unread count when opening chat
    setUnreadCounts((prev) => ({
      ...prev,
      [selectedChat.id]: 0,
    }));

    return () => unsubscribe();
  }, [selectedChat, user, messages.length]);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Send message
  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!message.trim() || !selectedChat) return;

    const messagesRef = collection(db, "chats", selectedChat.id, "messages");
    await addDoc(messagesRef, {
      text: message,
      sender: user.email,
      timestamp: serverTimestamp(),
    });

    setMessage("");
  };

  // Group messages by date
  const groupMessagesByDate = (msgs) => {
    const groups = {};
    msgs.forEach((msg) => {
      const dateObj = msg.timestamp?.toDate
        ? msg.timestamp.toDate()
        : new Date(msg.timestamp);
      const today = new Date();
      const yesterday = new Date(today);
      yesterday.setDate(today.getDate() - 1);

      let key = dateObj.toLocaleDateString();
      if (
        dateObj.getFullYear() === today.getFullYear() &&
        dateObj.getMonth() === today.getMonth() &&
        dateObj.getDate() === today.getDate()
      ) {
        key = "Today";
      } else if (
        dateObj.getFullYear() === yesterday.getFullYear() &&
        dateObj.getMonth() === yesterday.getMonth() &&
        dateObj.getDate() === yesterday.getDate()
      ) {
        key = "Yesterday";
      }

      if (!groups[key]) groups[key] = [];
      groups[key].push(msg);
    });
    return groups;
  };

  if (!user) return null;

  const groupedMessages = groupMessagesByDate(messages);

  return (
    <SidebarLayout>
      <div className="max-w-6xl mx-auto px-4 py-8 flex flex-col lg:flex-row gap-6">
        {/* Chat list */}
        <div className="lg:w-1/4 bg-white rounded-2xl p-4 shadow-lg h-[80vh] overflow-y-auto">
          <h2 className="text-xl font-bold mb-4 text-gray-900 flex justify-between items-center">
            My Chats
            {Object.values(unreadCounts).some((c) => c > 0) && (
              <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">
                {Object.values(unreadCounts).reduce((a, b) => a + b, 0)}
              </span>
            )}
          </h2>
          {chats.length === 0 ? (
            <p className="text-gray-700">No chats yet.</p>
          ) : (
            chats.map((chat) => (
              <div
                key={chat.id}
                onClick={() => setSelectedChat(chat)}
                className={`cursor-pointer p-3 rounded-xl mb-2 transition-all flex justify-between items-center ${
                  selectedChat?.id === chat.id
                    ? "bg-blue-500 text-white font-semibold"
                    : "hover:bg-gray-100 text-gray-900"
                }`}
              >
                <span>{chat.requestTitle}</span>
                {unreadCounts[chat.id] > 0 && (
                  <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">
                    {unreadCounts[chat.id]}
                  </span>
                )}
              </div>
            ))
          )}
        </div>

        {/* Chat window */}
        <div className="lg:w-3/4 bg-white rounded-2xl p-6 shadow-lg flex flex-col h-[80vh]">
          {selectedChat ? (
            <>
              <h2 className="text-xl font-bold mb-4 text-gray-900">
                {selectedChat.requestTitle}
              </h2>
              <div className="flex-1 overflow-y-auto mb-4 flex flex-col gap-2">
                {messages.length === 0 ? (
                  <p className="text-gray-700 text-center mt-8">
                    No messages yet. Start the conversation!
                  </p>
                ) : (
                  Object.entries(groupedMessages).map(([date, msgs]) => (
                    <div key={date}>
                      <div className="text-center text-gray-400 text-xs my-2 font-semibold">
                        {date}
                      </div>
                      {msgs.map((msg, index) => {
                        const prevMsg = index > 0 ? msgs[index - 1] : null;
                        const isConsecutive =
                          prevMsg && prevMsg.sender === msg.sender;

                        return (
                          <div
                            key={msg.id}
                            className={`max-w-xs px-3 py-2 rounded-xl break-words ${
                              isConsecutive ? "mt-3" : ""
                            } ${
                              msg.sender === user.email
                                ? "bg-blue-600 text-white self-end ml-auto"
                                : "bg-gray-200 text-gray-900 self-start"
                            }`}
                          >
                            <p>{msg.text}</p>
                            <div className="flex justify-between items-center text-xs mt-1">
                              <span
                                className={`${
                                  msg.sender === user.email
                                    ? "text-blue-100"
                                    : "text-gray-600"
                                } font-semibold`}
                              >
                                {msg.sender === user.email ? "You" : msg.sender}
                              </span>
                              <span className="text-gray-400 ml-2">
                                {msg.timestamp?.toDate
                                  ? msg.timestamp
                                      .toDate()
                                      .toLocaleTimeString([], {
                                        hour: "2-digit",
                                        minute: "2-digit",
                                      })
                                  : ""}
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ))
                )}
                <div ref={messagesEndRef}></div>
              </div>

              <form onSubmit={handleSendMessage} className="flex gap-2">
                <input
                  type="text"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Type a message..."
                  className="flex-1 border border-gray-300 rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                />
                <button
                  type="submit"
                  className="bg-blue-600 text-white px-4 py-2 rounded-xl hover:bg-blue-700 transition-all font-medium"
                >
                  Send
                </button>
              </form>
            </>
          ) : (
            <p className="text-gray-700 text-center mt-8">
              Select a chat to start messaging.
            </p>
          )}
        </div>
      </div>
    </SidebarLayout>
  );
}
