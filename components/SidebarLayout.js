import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { auth } from "../firebase";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { HiMenu, HiX } from "react-icons/hi";
import { CiLogout } from "react-icons/ci";
import {
  MdDashboard,
  MdAddCircleOutline,
  MdList,
  MdChat,
  MdForum,
} from "react-icons/md";
import { BiChevronLeft, BiChevronRight } from "react-icons/bi";

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
        router.push("/");
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
    { name: "Dashboard", route: "/dashboard", icon: MdDashboard },
    {
      name: "New Request",
      route: "/dashboard/new-request",
      icon: MdAddCircleOutline,
    },
    { name: "My Requests", route: "/dashboard/my-requests", icon: MdList },
    { name: "All Requests", route: "/dashboard/all-requests", icon: MdList },
    { name: "My Chats", route: "/dashboard/my-chats", icon: MdChat },
    {
      name: "Discussion Boards",
      route: "/dashboard/discussion-board",
      icon: MdForum,
    },
  ];

  const isActive = (route) => router.pathname === route;

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Desktop Sidebar */}
      <aside
        className={`bg-white shadow-xl transition-all duration-300 ease-in-out ${
          sidebarCollapsed ? "w-20" : "w-72"
        } hidden lg:flex flex-col relative border-r border-gray-200`}
      >
        {/* Header */}
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-center justify-between">
            {!sidebarCollapsed && (
              <div
                onClick={() => router.push("/dashboard")}
                className="flex items-center space-x-2 cursor-pointer"
              >
                <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-red-700 rounded-xl flex items-center justify-center shadow-lg">
                  <span className="text-white font-bold text-xl">
                    <img
                      src="/logo.png"
                      className="bg-white rounded-full size-9"
                    />
                  </span>
                </div>
                <h2 className="text-2xl font-bold bg-gradient-to-r from-red-600 to-red-900 bg-clip-text text-transparent">
                  AidLink
                </h2>
              </div>
            )}
            {sidebarCollapsed && (
              <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-red-700 rounded-xl flex items-center justify-center shadow-lg mx-auto">
                <span
                  onClick={() => router.push("/dashboard")}
                  className="text-white font-bold text-xl"
                ></span>
              </div>
            )}
          </div>
        </div>

        {/* Toggle Button */}
        <button
          onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
          className="absolute -right-3 top-24 bg-white border border-gray-200 rounded-full p-1.5 shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-110 text-gray-600 hover:text-red-600"
        >
          {sidebarCollapsed ? (
            <BiChevronRight size={20} />
          ) : (
            <BiChevronLeft size={20} />
          )}
        </button>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.route);
            return (
              <button
                key={item.name}
                onClick={() => router.push(item.route)}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 group ${
                  active
                    ? "bg-gradient-to-r from-red-500 to-red-600 text-white shadow-lg shadow-red-200"
                    : "text-gray-700 hover:bg-gray-50 hover:text-red-600"
                }`}
                title={sidebarCollapsed ? item.name : ""}
              >
                <Icon
                  size={22}
                  className={`flex-shrink-0 ${
                    active
                      ? "text-white"
                      : "text-gray-500 group-hover:text-red-600"
                  }`}
                />
                {!sidebarCollapsed && (
                  <span className="font-medium text-left">{item.name}</span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Profile / Logout */}
        <div className="p-4 border-t border-gray-100">
          <div
            className={`flex items-center ${
              sidebarCollapsed ? "justify-center" : "space-x-3"
            } mb-4 p-3 rounded-xl bg-gray-50`}
          >
            <div className="relative">
              <img
                src={user.photoURL}
                alt="avatar"
                className="w-10 h-10 rounded-full border-2 border-white shadow-md object-cover"
              />
              <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
            </div>
            {!sidebarCollapsed && (
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-gray-800 truncate text-sm">
                  {user.displayName}
                </p>
                <p className="text-xs text-gray-500 truncate">{user.email}</p>
              </div>
            )}
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center space-x-2 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white px-4 py-3 rounded-xl font-medium transition-all duration-200 shadow-md hover:shadow-lg"
          >
            <CiLogout size={20} />
            {!sidebarCollapsed && <span>Logout</span>}
          </button>
        </div>
      </aside>

      {/* Mobile Sidebar Overlay */}
      <div
        className={`fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden transition-opacity duration-300 ${
          sidebarOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        onClick={() => setSidebarOpen(false)}
      ></div>

      {/* Mobile Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 bg-white z-50 w-72 transform transition-transform duration-300 lg:hidden shadow-2xl ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Mobile Header */}
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-red-700 rounded-xl flex items-center justify-center shadow-lg">
                <span className="text-white font-bold text-xl">A</span>
              </div>
              <h2 className="text-2xl font-bold bg-gradient-to-r from-red-600 to-red-900 bg-clip-text text-transparent">
                AidLink
              </h2>
            </div>
            <button
              onClick={() => setSidebarOpen(false)}
              className="text-gray-500 hover:text-gray-700 transition-colors"
            >
              <HiX size={24} />
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto h-[calc(100vh-200px)]">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.route);
            return (
              <button
                key={item.name}
                onClick={() => {
                  router.push(item.route);
                  setSidebarOpen(false);
                }}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                  active
                    ? "bg-gradient-to-r from-red-500 to-red-600 text-white shadow-lg shadow-red-200"
                    : "text-gray-700 hover:bg-gray-50 hover:text-red-600"
                }`}
              >
                <Icon
                  size={22}
                  className={active ? "text-white" : "text-gray-500"}
                />
                <span className="font-medium">{item.name}</span>
              </button>
            );
          })}
        </nav>

        {/* Mobile Profile / Logout */}
        <div className="p-4 border-t border-gray-100">
          <div className="flex items-center space-x-3 mb-4 p-3 rounded-xl bg-gray-50">
            <div className="relative">
              <img
                src={user.photoURL}
                alt="avatar"
                className="w-10 h-10 rounded-full border-2 border-white shadow-md object-cover"
              />
              <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-gray-800 truncate text-sm">
                {user.displayName}
              </p>
              <p className="text-xs text-gray-500 truncate">{user.email}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center space-x-2 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white px-4 py-3 rounded-xl font-medium transition-all duration-200 shadow-md hover:shadow-lg"
          >
            <CiLogout size={20} />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-auto">
        {/* Mobile Hamburger */}
        <div className="lg:hidden p-4 bg-white shadow-sm sticky top-0 z-30">
          <button
            onClick={() => setSidebarOpen(true)}
            className="text-gray-700 hover:text-red-600 transition-colors p-2 hover:bg-gray-50 rounded-lg"
          >
            <HiMenu size={28} />
          </button>
        </div>

        {/* Page content */}
        <div className="p-6">{children}</div>
      </main>
    </div>
  );
}
