import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { auth, db } from "../../firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import SidebarLayout from "../../components/SidebarLayout";

export default function NewRequest() {
  const router = useRouter();
  const [user, setUser] = useState(null);

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

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "Health",
    urgency: "Normal",
    contact: "",
    requestedAt: "",
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.title || !formData.description) {
      alert("Please fill out the required fields.");
      return;
    }

    try {
      await addDoc(collection(db, "requests"), {
        ...formData,
        userId: user.uid,
        userName: user.displayName,
        userEmail: user.email,
        timestamp: serverTimestamp(),
        requestedAt: formData.requestedAt
          ? new Date(formData.requestedAt)
          : null,
        status: "pending", // <-- default status added
      });

      alert("Request submitted successfully!");
      router.push("/dashboard");
    } catch (error) {
      console.error("Error submitting request:", error);
      alert("Failed to submit request.");
    }
  };

  if (!user) return null;

  return (
    <SidebarLayout>
      <div className="w-full max-w-2xl bg-white shadow-lg rounded-2xl p-8 mx-auto">
        <h1 className="text-2xl font-bold mb-6 text-blue-600">
          Create New Aid Request
        </h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Title */}
          <div>
            <label className="block text-gray-700 font-medium mb-1">
              Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              className="text-gray-600 w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter request title"
              required
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-gray-700 font-medium mb-1">
              Description <span className="text-red-500">*</span>
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              className="text-gray-600 w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Describe the aid needed"
              rows={4}
              required
            />
          </div>

          {/* Category */}
          <div>
            <label className="block text-gray-700 font-medium mb-1">
              Category
            </label>
            <select
              name="category"
              value={formData.category}
              onChange={handleChange}
              className="text-gray-600 w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option>Health</option>
              <option>Safety</option>
              <option>Environment</option>
              <option>Groceries</option>
              <option>Tutoring</option>
              <option>Building</option>
              <option>Carrying Something</option>
              <option>Other</option>
            </select>
          </div>

          {/* Urgency */}
          <div>
            <label className="block text-gray-700 font-medium mb-1">
              Urgency
            </label>
            <select
              name="urgency"
              value={formData.urgency}
              onChange={handleChange}
              className="text-gray-600 w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option>Normal</option>
              <option>High</option>
              <option>Critical</option>
            </select>
          </div>

          {/* Contact (optional) */}
          <div>
            <label className="block text-gray-700 font-medium mb-1">
              Contact Info (optional)
            </label>
            <input
              type="text"
              name="contact"
              value={formData.contact}
              onChange={handleChange}
              className="text-gray-600 w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Phone or email"
            />
          </div>

          {/* Date/Time */}
          <div>
            <label className="block text-gray-700 font-medium mb-1">
              When do you need the aid? <span className="text-red-500">*</span>
            </label>
            <input
              type="datetime-local"
              name="requestedAt"
              value={formData.requestedAt}
              onChange={handleChange}
              className="text-gray-600 w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl font-semibold shadow-lg transition-all duration-200 hover:scale-[1.03]"
          >
            Submit Request
          </button>
        </form>
      </div>
    </SidebarLayout>
  );
}
