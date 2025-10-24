import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { auth } from "../firebase";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { HiMenu, HiX } from "react-icons/hi";
import { CiLogout } from "react-icons/ci";

export default function SidebarLayout({ children }) {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      if (u) {
        setUser(u);
      } else {
        router.push("/"); // redirect if not logged in
      }
    });
    return () => unsubscribe();
  }, [router]);

  const handleLogout = async () => {
    await signOut(auth);
    router.push("/");
  };

  if (!user) return null;

  const navItems = [
    { name: "Dashboard", route: "/dashboard" },
    { name: "New Request", route: "/dashboard/new-request" },
    { name: "My Requests", route: "/dashboard/my-requests" },
    { name: "All Requests", route: "/dashboard/all-requests" },
    { name: "My Chats", route: "/dashboard/my-chats" },
    { name: "Discussion Boards", route: "/dashboard/discussion-board" },
  ];

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Desktop Sidebar */}
      <aside
        className={`bg-white shadow-lg transition-all duration-300 ${
          sidebarCollapsed ? "w-20" : "w-64"
        } hidden lg:flex flex-col p-6`}
      >
        <div className="flex justify-between items-center mb-8">
          {!sidebarCollapsed && (
            <h2 className="text-2xl font-bold text-red-600">
              Aid<span className="text-red-900">Link</span>
            </h2>
          )}
          <button
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="text-gray-500 hover:text-gray-700"
          >
            {sidebarCollapsed ? "»" : "«"}
          </button>
        </div>

        <nav className="flex-1 flex flex-col space-y-4">
          {navItems.map((item) => (
            <button
              key={item.name}
              onClick={() => router.push(item.route)}
              className={`text-gray-700 hover:text-blue-600 font-medium text-left truncate`}
              title={item.name}
            >
              {sidebarCollapsed ? item.name[0] : item.name}
            </button>
          ))}
        </nav>

        {/* Profile / Logout */}
        <div className="mt-auto pt-6 border-t border-gray-200">
          <div className="flex items-center space-x-3 mb-4">
            <img
              src={user.photoURL}
              alt="avatar"
              className="w-10 h-10 rounded-full border object-cover"
            />
            {!sidebarCollapsed && (
              <span className="font-medium text-gray-700">
                {user.displayName}
              </span>
            )}
          </div>
          <button
            onClick={handleLogout}
            className="w-full bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg"
          >
            {!sidebarCollapsed ? "Logout" : <CiLogout />}
          </button>
        </div>
      </aside>

      {/* Mobile Sidebar Overlay */}
      <div
        className={`fixed inset-0 bg-black bg-opacity-50 z-50 lg:hidden transition-opacity duration-300 ${
          sidebarOpen ? "block" : "hidden"
        }`}
        onClick={() => setSidebarOpen(false)}
      ></div>

      {/* Mobile Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 bg-white z-50 w-64 p-6 transform transition-transform duration-300 lg:hidden ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-2xl font-bold text-blue-600">AidLink</h2>
          <button onClick={() => setSidebarOpen(false)}>
            <HiX size={24} />
          </button>
        </div>

        <nav className="flex flex-col space-y-4">
          {navItems.map((item) => (
            <button
              key={item.name}
              onClick={() => {
                router.push(item.route);
                setSidebarOpen(false);
              }}
              className="text-gray-700 hover:text-blue-600 font-medium text-left"
            >
              {item.name}
            </button>
          ))}
        </nav>

        <div className="mt-auto pt-6 border-t border-gray-200">
          <div className="flex items-center space-x-3 mb-4">
            <img
              src={user.photoURL}
              alt="avatar"
              className="w-10 h-10 rounded-full border object-cover"
            />
            <span className="font-medium text-gray-700">
              {user.displayName}
            </span>
          </div>
          <button
            onClick={handleLogout}
            className="w-full bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg"
          >
            Logout
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 p-6">
        {/* Mobile Hamburger */}
        <div className="lg:hidden mb-4">
          <button onClick={() => setSidebarOpen(true)}>
            <HiMenu size={28} />
          </button>
        </div>

        {/* Page content */}
        {children}
      </main>
    </div>
  );
}
