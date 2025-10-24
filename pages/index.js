import { useAuthState } from "react-firebase-hooks/auth";
import { auth, provider } from "../firebase";
import { signInWithPopup, signOut } from "firebase/auth";
import { useRouter } from "next/router";
import { useEffect } from "react";

export default function Home() {
  const [user, loading] = useAuthState(auth);
  const router = useRouter();

  const signInWithGoogle = async () => {
    try {
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error("Error signing in:", error);
    }
  };

  const logout = async () => {
    await signOut(auth);
  };

  useEffect(() => {
    if (!loading && user) {
      router.push("/dashboard");
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 flex justify-center items-center px-4">
      <div className="bg-white/95 backdrop-blur-md rounded-3xl shadow-2xl p-10 w-full max-w-md text-center">
        <h1 className="text-4xl font-extrabold text-gray-800 mb-2">AidLink</h1>
        <p className="text-gray-600 mb-8">
          Connecting communities through service and support
        </p>

        <button
          onClick={signInWithGoogle}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-xl shadow-lg transition-all duration-200 hover:scale-[1.03]"
        >
          <div className="flex justify-center items-center space-x-3">
            <img
              src="https://www.svgrepo.com/show/475656/google-color.svg"
              alt="Google"
              className="w-6 h-6"
            />
            <span>Sign in with Google</span>
          </div>
        </button>

        <p className="mt-8 text-sm text-gray-500">
          By signing in, you agree to uphold AidLink’s mission of
          <br />
          <span className="font-medium text-gray-700">
            “Empowering anyone to give or get help.”
          </span>
        </p>
      </div>
    </div>
  );
}
