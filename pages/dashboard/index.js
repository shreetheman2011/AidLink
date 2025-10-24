import SidebarLayout from "../../components/SidebarLayout";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { auth, db } from "../../firebase";
import { collection, query, getDocs, where } from "firebase/firestore";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

export default function DashboardContent() {
  const router = useRouter();
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    resolved: 0,
    cancelled: 0,
  });
  const [chartData, setChartData] = useState({
    labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
    datasets: [
      {
        label: "Requests",
        data: [0, 0, 0, 0, 0, 0, 0],
        backgroundColor: "rgba(59, 130, 246, 0.7)",
      },
    ],
  });
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchData = async () => {
    if (!auth.currentUser) return;

    setIsRefreshing(true);

    try {
      // Get all requests from Firestore
      const q = query(collection(db, "requests")); // you can filter by user if needed
      const snapshot = await getDocs(q);

      let total = 0,
        pending = 0,
        resolved = 0,
        cancelled = 0;

      const dailyCounts = [0, 0, 0, 0, 0, 0, 0]; // Mon-Sun

      snapshot.forEach((doc) => {
        const data = doc.data();
        total++;

        if (data.status === "pending") pending++;
        else if (data.status === "resolved") resolved++;
        else if (data.status === "cancelled") cancelled++;

        if (data.requestedAt) {
          const date = data.requestedAt.toDate
            ? data.requestedAt.toDate()
            : new Date(data.requestedAt);
          const day = date.getDay(); // Sunday = 0
          const index = day === 0 ? 6 : day - 1; // Mon=0, ..., Sun=6
          dailyCounts[index]++;
        }
      });

      setStats({ total, pending, resolved, cancelled });
      setChartData((prev) => ({
        ...prev,
        datasets: [{ ...prev.datasets[0], data: dailyCounts }],
      }));
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <SidebarLayout>
      {/* Header with Refresh Button */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>
        <button
          onClick={fetchData}
          disabled={isRefreshing}
          className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg font-medium shadow-sm transition-all duration-200 hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
        >
          <svg
            className={`w-4 h-4 ${isRefreshing ? "animate-spin" : ""}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
            />
          </svg>
          {isRefreshing ? "Refreshing..." : "Refresh Stats"}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Stats cards */}
        <div className="grid grid-cols-2 lg:grid-cols-1 gap-6">
          <div className="bg-blue-500 text-white rounded-2xl p-6 shadow-lg">
            <p className="text-sm">Total Requests</p>
            <p className="text-2xl font-bold mt-2">{stats.total}</p>
          </div>
          <div className="bg-yellow-500 text-white rounded-2xl p-6 shadow-lg">
            <p className="text-sm">Pending Requests</p>
            <p className="text-2xl font-bold mt-2">{stats.pending}</p>
          </div>
          <div className="bg-purple-500 text-white rounded-2xl p-6 shadow-lg">
            <p className="text-sm">Resolved Requests</p>
            <p className="text-2xl font-bold mt-2">{stats.resolved}</p>
          </div>
          <div className="bg-red-500 text-white rounded-2xl p-6 shadow-lg">
            <p className="text-sm">Cancelled Requests</p>
            <p className="text-2xl font-bold mt-2">{stats.cancelled}</p>
          </div>
        </div>

        {/* Weekly requests chart */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-6 shadow-lg h-64">
          <h2 className="text-lg font-semibold mb-4 text-gray-600">
            Requests This Week
          </h2>
          <Bar
            data={chartData}
            options={{
              responsive: true,
              plugins: { legend: { display: false } },
              maintainAspectRatio: false,
            }}
          />
        </div>
      </div>

      {/* CTA */}
      <div className="bg-white rounded-2xl p-6 shadow-lg text-center">
        <h2 className="text-lg font-semibold mb-4 text-gray-500">
          Need to create a new aid request?
        </h2>
        <button
          onClick={() => router.push("/dashboard/new-request")}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-semibold shadow-lg transition-all duration-200 hover:scale-[1.03]"
        >
          + New Request
        </button>
      </div>
    </SidebarLayout>
  );
}
