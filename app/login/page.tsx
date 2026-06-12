"use client";

import { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth, db } from "@/lib/firebase";
import { useRouter } from "next/navigation";
import { collection, query, where, getDocs } from "firebase/firestore";

export default function ManagerLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();

  const handleLogin = async () => {
    try {
      const userCred = await signInWithEmailAndPassword(auth, email, password);

      const q = query(
        collection(db, "users"),
        where("email", "==", userCred.user.email)
      );

      const snap = await getDocs(q);

      if (snap.empty) {
        alert("No account found");
        return;
      }

      const data = snap.docs[0].data();

      if (data.role !== "manager") {
        alert("Access denied");
        return;
      }

      router.push("/manager/dashboard");

    } catch (error: any) {
      alert(error.message);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-black text-white">
      <div className="bg-gray-900 p-6 rounded-xl w-80">
        <h1 className="text-xl mb-4">Manager Login</h1>

        <input
          className="w-full mb-3 p-2 bg-gray-800 rounded"
          placeholder="Email"
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          type="password"
          className="w-full mb-3 p-2 bg-gray-800 rounded"
          placeholder="Password"
          onChange={(e) => setPassword(e.target.value)}
        />

        <button
          onClick={handleLogin}
          className="w-full bg-green-500 p-2 rounded"
        >
          Login
        </button>
      </div>
    </div>
  );
}