"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { authStorage } from "@/lib/auth-storage";
import { getAccessCapabilities, getDefaultPrivateRoute } from "@/lib/access-control";

export default function WorkerLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const user = authStorage.getUser();
  const access = getAccessCapabilities(user);

  useEffect(() => {
    if (!access.canProvideServices) {
      router.replace(getDefaultPrivateRoute(user));
    }
  }, [access.canProvideServices, router, user]);

  if (!access.canProvideServices) return null;
  return <>{children}</>;
}
