"use client";
import { useSession, signIn, signOut } from "next-auth/react";

export default function ProfileBar() {
  const { data: session, status } = useSession();
  const loading = status === "loading";

  return (
    <header className="w-full flex items-center justify-between px-6 py-3 bg-gray-900 text-white shadow-md">
      <div className="font-bold text-lg">Space Calendar</div>
      <div>
        {loading ? (
          <span>Loading...</span>
        ) : session ? (
          <div className="flex items-center gap-3">
            {session.user?.image && (
              <img src={session.user.image} alt="avatar" className="w-8 h-8 rounded-full border" />
            )}
            <span>{session.user?.name || session.user?.email}</span>
            <button
              onClick={() => signOut()}
              className="ml-3 px-3 py-1 rounded bg-indigo-600 hover:bg-indigo-700 text-white"
            >
              Sign out
            </button>
          </div>
        ) : (
          <button
            onClick={() => signIn("google")}
            className="px-4 py-2 rounded bg-indigo-600 hover:bg-indigo-700 text-white"
          >
            Sign in with Google
          </button>
        )}
      </div>
    </header>
  );
} 