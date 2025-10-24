// pages/dashboard/discussion-board.js
import { useEffect, useState, useRef } from "react";
import { auth, db } from "../../firebase";
import { onAuthStateChanged } from "firebase/auth";
import {
  collection,
  query,
  where,
  onSnapshot,
  addDoc,
  serverTimestamp,
  doc,
  updateDoc,
  orderBy,
} from "firebase/firestore";
import SidebarLayout from "../../components/SidebarLayout";

export default function DiscussionBoard() {
  const [user, setUser] = useState(null);
  const [boards, setBoards] = useState([]);
  const [selectedBoard, setSelectedBoard] = useState(null);
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState("");
  const [newBoardTitle, setNewBoardTitle] = useState("");
  const [newBoardDescription, setNewBoardDescription] = useState("");
  const messagesEndRef = useRef(null);

  // Auth check
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

  useEffect(() => {
    if (!user) return;
    const boardsRef = collection(db, "discussionBoards");
    const unsubscribe = onSnapshot(boardsRef, (snapshot) => {
      const data = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setBoards(data);
      if (!selectedBoard && data.length > 0) setSelectedBoard(data[0]);
    });
    return () => unsubscribe();
  }, [user, selectedBoard]);

  // Fetch messages for selected board
  useEffect(() => {
    if (!selectedBoard) return;
    const messagesRef = collection(
      db,
      "discussionBoards",
      selectedBoard.id,
      "messages"
    );
    const q = query(messagesRef, orderBy("timestamp", "asc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const msgs = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setMessages(msgs);
    });
    return () => unsubscribe();
  }, [selectedBoard]);

  // Scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Send message
  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!message.trim() || !selectedBoard) return;

    const messagesRef = collection(
      db,
      "discussionBoards",
      selectedBoard.id,
      "messages"
    );
    await addDoc(messagesRef, {
      text: message,
      sender: user.email,
      timestamp: serverTimestamp(),
    });
    setMessage("");
  };

  // Create a new board
  const handleCreateBoard = async () => {
    if (!newBoardTitle.trim()) return;
    const boardsRef = collection(db, "discussionBoards");
    const docRef = await addDoc(boardsRef, {
      title: newBoardTitle,
      description: newBoardDescription,
      participants: [user.email],
      createdBy: user.email,
      timestamp: serverTimestamp(),
    });
    setNewBoardTitle("");
    setNewBoardDescription("");
    setSelectedBoard({
      id: docRef.id,
      title: newBoardTitle,
      description: newBoardDescription,
      participants: [user.email],
    });
  };

  // Join board
  const handleJoinBoard = async (boardId, participants) => {
    if (participants.includes(user.email)) return;
    const boardRef = doc(db, "discussionBoards", boardId);
    await updateDoc(boardRef, { participants: [...participants, user.email] });
  };

  if (!user) return null;

  return (
    <SidebarLayout>
      <div className="max-w-6xl mx-auto px-4 py-8 flex flex-col lg:flex-row gap-6">
        {/* Board list */}
        <div className="lg:w-1/4 bg-white rounded-2xl p-4 shadow-lg h-[80vh] overflow-y-auto border border-gray-200">
          <h2 className="text-xl font-bold mb-4 text-gray-900">
            Discussion Boards
          </h2>

          {/* Create board */}
          <div className="mb-4 pb-4 border-b border-gray-200">
            <input
              type="text"
              value={newBoardTitle}
              onChange={(e) => setNewBoardTitle(e.target.value)}
              placeholder="New board title"
              className="text-gray-900 w-full mb-2 border border-gray-300 px-3 py-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50"
            />
            <input
              type="text"
              value={newBoardDescription}
              onChange={(e) => setNewBoardDescription(e.target.value)}
              placeholder="Description (optional)"
              className="text-gray-900 w-full mb-2 border border-gray-300 px-3 py-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50"
            />
            <button
              onClick={handleCreateBoard}
              className="w-full bg-blue-600 text-white py-2 rounded-xl hover:bg-blue-700 transition-all font-semibold shadow-sm"
            >
              + Create Board
            </button>
          </div>

          {/* Existing boards */}
          {boards.length === 0 ? (
            <p className="text-gray-500 text-sm text-center mt-4">
              No boards yet.
            </p>
          ) : (
            boards.map((board) => (
              <div
                key={board.id}
                className={`p-3 rounded-xl mb-2 cursor-pointer transition-all border ${
                  selectedBoard?.id === board.id
                    ? "bg-blue-600 text-white font-semibold border-blue-700 shadow-md"
                    : "hover:bg-gray-50 text-gray-900 border-gray-200 hover:border-gray-300"
                }`}
              >
                <div onClick={() => setSelectedBoard(board)}>
                  <p className="font-medium">{board.title}</p>
                  <p
                    className={`text-sm truncate ${
                      selectedBoard?.id === board.id
                        ? "text-blue-100"
                        : "text-gray-600"
                    }`}
                  >
                    {board.description}
                  </p>
                  <p
                    className={`text-xs ${
                      selectedBoard?.id === board.id
                        ? "text-blue-200"
                        : "text-gray-500"
                    }`}
                  >
                    {board.participants.length} participants
                  </p>
                </div>
                {!board.participants.includes(user.email) && (
                  <button
                    onClick={() =>
                      handleJoinBoard(board.id, board.participants)
                    }
                    className="mt-2 w-full bg-green-500 text-white py-1 rounded-xl text-sm hover:bg-green-600 transition-all shadow-sm"
                  >
                    Join Board
                  </button>
                )}
              </div>
            ))
          )}
        </div>

        {/* Chat window */}
        <div className="lg:w-3/4 bg-white rounded-2xl p-6 shadow-lg flex flex-col h-[80vh] border border-gray-200">
          {selectedBoard ? (
            <>
              <div className="border-b border-gray-200 pb-4 mb-4">
                <h2 className="text-2xl font-bold text-gray-900">
                  {selectedBoard.title}
                </h2>
                {selectedBoard.description && (
                  <p className="text-sm text-gray-600 mt-1">
                    {selectedBoard.description}
                  </p>
                )}
              </div>
              <div className="flex-1 overflow-y-auto mb-4 flex flex-col gap-3 px-2">
                {messages.length === 0 ? (
                  <p className="text-gray-500 text-center mt-8">
                    No messages yet. Start the conversation!
                  </p>
                ) : (
                  messages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`max-w-md px-4 py-3 rounded-2xl break-words shadow-sm ${
                        msg.sender === user.email
                          ? "bg-blue-600 text-white self-end ml-auto"
                          : "bg-gray-100 text-gray-900 self-start border border-gray-200"
                      }`}
                    >
                      <p className="leading-relaxed">{msg.text}</p>
                      <p
                        className={`text-xs mt-2 ${
                          msg.sender === user.email
                            ? "text-blue-100"
                            : "text-gray-500"
                        }`}
                      >
                        {msg.sender === user.email ? "You" : msg.sender} •{" "}
                        {msg.timestamp?.toDate
                          ? msg.timestamp.toDate().toLocaleTimeString("en-US", {
                              hour: "numeric",
                              minute: "2-digit",
                              hour12: true,
                            })
                          : "Sending..."}
                      </p>
                    </div>
                  ))
                )}
                <div ref={messagesEndRef}></div>
              </div>

              <form
                onSubmit={handleSendMessage}
                className="flex gap-2 border-t border-gray-200 pt-4"
              >
                <input
                  type="text"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Type a message..."
                  className="flex-1 border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-gray-50"
                />
                <button
                  type="submit"
                  className="bg-blue-600 text-white px-6 py-3 rounded-xl hover:bg-blue-700 transition-all font-semibold shadow-sm"
                >
                  Send
                </button>
              </form>
            </>
          ) : (
            <p className="text-gray-500 text-center mt-8">
              Select a board to start messaging.
            </p>
          )}
        </div>
      </div>
    </SidebarLayout>
  );
}
