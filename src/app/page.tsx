"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth";

export default function HomePage() {
  const { user, loading, isUserApproved } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (user && isUserApproved) {
        router.push("/dashboard");
      } else if (user && !isUserApproved) {
        router.push("/dashboard"); // Will show pending message
      } else {
        router.push("/login");
      }
    }
  }, [user, loading, isUserApproved, router]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#A72036] mx-auto"></div>
        <p className="mt-4 text-gray-600">Loading...</p>
      </div>
    </div>
  );
}
