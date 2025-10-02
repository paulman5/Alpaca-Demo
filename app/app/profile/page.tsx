"use client";

import ProfileHeader from "@/components/features/profile/profileheader";
import ProfileTabs from "@/components/features/profile/profiletabs";
import { Suspense } from "react";

export default function ProfilePage() {
  return (
    <div className="space-y-8">
      {/* Page banner */}
      <div className="bg-gradient-to-r from-[#004040] via-[#035a5a] to-[#004040] rounded-none p-6 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.08),transparent_50%)]"></div>
        <div className="relative z-10">
          <h1 className="text-2xl md:text-3xl font-bold">Profile</h1>
          <p className="text-sm md:text-base text-[#cfe7e7] mt-1">Manage your account and preferences.</p>
        </div>
      </div>
      <div className="border border-[#004040]/15 bg-white rounded-none shadow-sm">

      </div>
      <Suspense fallback={<div>Loading....</div>}>
        <div className="border border-[#004040]/15 bg-white rounded-none shadow-sm">
          <ProfileTabs />
        </div>
      </Suspense>
    </div>
  );
}
