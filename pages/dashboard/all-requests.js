// pages/dashboard/all-requests.js
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { auth, db } from "../../firebase";
import { onAuthStateChanged } from "firebase/auth";
import {
  collection,
  query,
  getDocs,
  doc,
  updateDoc,
  where,
  addDoc,
} from "firebase/firestore";
import SidebarLayout from "../../components/SidebarLayout";

export default function AllRequests() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      if (u) {
        setUser(u);
      } else {
        router.push("/");
      }
    });
    return () => unsubscribe();
  }, [router]);

  // Fetch requests from Firestore
  useEffect(() => {
    const fetchRequests = async () => {
      const q = query(collection(db, "requests"));
      const snapshot = await getDocs(q);
      const allRequests = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setRequests(allRequests);
      setLoading(false);
    };

    fetchRequests();
  }, []);

  // Helper: ensure chat exists
  const ensureChatExists = async (request) => {
    const chatsRef = collection(db, "chats");
    const chatQuery = query(chatsRef, where("requestId", "==", request.id));
    const snapshot = await getDocs(chatQuery);
    if (snapshot.empty) {
      await addDoc(chatsRef, {
        requestId: request.id,
        requestTitle: request.title,
        participants: [request.userEmail, request.volunteer || user.email],
        messages: [],
        createdAt: new Date(),
      });
    }
  };

  // Volunteer for a request
  const handleVolunteer = async (requestId, requesteeName) => {
    if (!user) return;

    const request = requests.find((r) => r.id === requestId);
    if (!request) return;

    const confirm = window.confirm(
      `Are you sure you want to volunteer for ${requesteeName}'s request?`
    );
    if (!confirm) return;

    const requestRef = doc(db, "requests", requestId);
    await updateDoc(requestRef, { volunteer: user.email });

    setRequests((prev) =>
      prev.map((r) =>
        r.id === requestId ? { ...r, volunteer: user.email } : r
      )
    );

    await ensureChatExists({ ...request, volunteer: user.email });
  };

  // Auto-create chat if someone volunteers for your request
  useEffect(() => {
    if (!user) return;

    const listenForVolunteer = async () => {
      const q = query(
        collection(db, "requests"),
        where("userEmail", "==", user.email)
      );
      const snapshot = await getDocs(q);
      snapshot.docs.forEach(async (docSnap) => {
        const requestData = docSnap.data();
        if (requestData.volunteer) {
          await ensureChatExists({ id: docSnap.id, ...requestData });
        }
      });
    };

    listenForVolunteer();
  }, [user]);

  // Filters + search
  const filteredRequests = requests
    .filter((r) => {
      if (filter === "all") return true;
      if (filter === "available") return !r.volunteer && r.status === "pending";
      if (filter === "claimed") return r.volunteer && r.status === "pending";
      if (filter === "resolved") return r.status === "resolved";
      return true;
    })
    .filter(
      (r) =>
        r.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.description.toLowerCase().includes(searchTerm.toLowerCase())
    );

  const getUrgencyStyles = (urgency) => {
    switch (urgency?.toLowerCase()) {
      case "high":
        return "bg-red-100 text-red-700 border-red-200";
      case "medium":
        return "bg-orange-100 text-orange-700 border-orange-200";
      case "low":
        return "bg-green-100 text-green-700 border-green-200";
      default:
        return "bg-gray-100 text-gray-700 border-gray-200";
    }
  };

  const getCategoryIcon = (category) => {
    const icons = {
      "Academic Help": "📚",
      "Mental Health": "💙",
      "Physical Health": "🏥",
      Financial: "💰",
      Housing: "🏠",
      Food: "🍽️",
      Transportation: "🚗",
      Other: "✨",
    };
    return icons[category] || "📋";
  };

  if (!user || loading) {
    return (
      <SidebarLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </SidebarLayout>
    );
  }

  return (
    <SidebarLayout>
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Community Requests
          </h1>
          <p className="text-gray-600 mb-4">
            Browse and volunteer for requests from your community
          </p>

          {/* Search */}
          <input
            type="text"
            placeholder="Search requests..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="text-gray-600 w-full max-w-md border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Filter Tabs */}
        <div className="mb-6 flex flex-wrap gap-2">
          {[
            { id: "all", label: "All Requests", count: requests.length },
            {
              id: "available",
              label: "Available",
              count: requests.filter(
                (r) => !r.volunteer && r.status === "pending"
              ).length,
            },
            {
              id: "claimed",
              label: "In Progress",
              count: requests.filter(
                (r) => r.volunteer && r.status === "pending"
              ).length,
            },
            {
              id: "resolved",
              label: "Resolved",
              count: requests.filter((r) => r.status === "resolved").length,
            },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilter(tab.id)}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                filter === tab.id
                  ? "bg-blue-600 text-white shadow-md"
                  : "bg-white text-gray-700 hover:bg-gray-50 border border-gray-200"
              }`}
            >
              {tab.label}
              <span
                className={`ml-2 px-2 py-0.5 rounded-full text-xs ${
                  filter === tab.id
                    ? "bg-blue-500 text-white"
                    : "bg-gray-100 text-gray-600"
                }`}
              >
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        {/* Requests Grid */}
        {filteredRequests.length === 0 ? (
          <div className="text-center py-16 bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl">
            <div className="text-6xl mb-4">🔍</div>
            <p className="text-xl text-gray-600 font-medium mb-2">
              No requests found
            </p>
            <p className="text-gray-500">
              Try adjusting your filters or check back later
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredRequests.map((r) => (
              <div
                key={r.id}
                className="bg-white border border-gray-200 rounded-2xl p-6 hover:shadow-xl transition-all duration-300 hover:border-blue-300"
              >
                <div className="flex flex-col lg:flex-row gap-6">
                  {/* Left - Icon */}
                  <div className="flex-shrink-0">
                    <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center text-3xl shadow-lg">
                      {getCategoryIcon(r.category)}
                    </div>
                  </div>

                  {/* Middle - Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between mb-3">
                      <h2 className="text-xl font-bold text-gray-900 mb-1">
                        {r.title}
                      </h2>
                      <div className="flex gap-2 flex-shrink-0 ml-4">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-semibold border ${getUrgencyStyles(
                            r.urgency
                          )}`}
                        >
                          {r.urgency || "Medium"}
                        </span>
                      </div>
                    </div>

                    <p className="text-gray-700 mb-4 leading-relaxed">
                      {r.description}
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                      <div className="flex items-center gap-2">
                        <span className="text-gray-500">👤</span>
                        <span className="text-gray-600">
                          <span className="font-medium">{r.userName}</span>
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-gray-500">📧</span>
                        <span className="text-gray-600">{r.userEmail}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-gray-500">🏷️</span>
                        <span className="text-gray-600">{r.category}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-gray-500">🕐</span>
                        <span className="text-gray-600">
                          {r.requestedAt?.toDate
                            ? r.requestedAt.toDate().toLocaleDateString()
                            : new Date(r.requestedAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>

                    {/* Status / Volunteer */}
                    <div className="flex flex-wrap items-center gap-4 mt-4 pt-4 border-t border-gray-100">
                      <div className="flex items-center gap-2">
                        <span className="text-gray-500 text-sm">Status:</span>
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            r.status === "pending"
                              ? "bg-yellow-100 text-yellow-700"
                              : r.status === "resolved"
                              ? "bg-green-100 text-green-700"
                              : "bg-red-100 text-red-700"
                          }`}
                        >
                          {r.status || "pending"}
                        </span>
                      </div>
                      {r.volunteer && (
                        <div className="flex items-center gap-2">
                          <span className="text-gray-500 text-sm">
                            Volunteer:
                          </span>
                          <span className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-medium">
                            ✓ {r.volunteer}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Right - Volunteer Button */}
                  {!r.volunteer &&
                    r.status === "pending" &&
                    r.userId !== user.uid && (
                      <div className="flex items-center">
                        <button
                          onClick={() => handleVolunteer(r.id, r.userName)}
                          className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-6 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 whitespace-nowrap"
                        >
                          🙋 Volunteer
                        </button>
                      </div>
                    )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </SidebarLayout>
  );
}
