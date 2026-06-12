"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function ManagerPage() {
  const router = useRouter();

  useEffect(() => {
    const manager = localStorage.getItem("manager");

    if (manager) {
      // already logged in → go dashboard
      router.push("/manager/dashboard");
    } else {
      // not logged in → go login
      router.push("/login");
    }
  }, []);

  return <p style={{ padding: 20 }}>Checking authentication...</p>;
}