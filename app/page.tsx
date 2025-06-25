"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import SplashScreen from "@/components/kokonutui/splash-screen";
import { useAuth } from "@/contexts/auth-context";

export default function Home() {
  const router = useRouter();
  const { user } = useAuth();
  const [isClient, setIsClient] = useState(false);
  const [isSplashVisible, setIsSplashVisible] = useState(true);

  //desc: this is to ensure that splash screen is shown only on the client side
  useEffect(() => {
    setIsClient(true);

    const timer = setTimeout(() => {
      setIsSplashVisible(false);

      const hasCompletedOnboarding =
        localStorage.getItem("onboardingCompleted") === "true";

      if (!hasCompletedOnboarding) {
        router.push("/onboarding");
      } else if (user) {
        router.push("/dashboard");
      } else {
        router.push("/login");
      }
    }, 3000);

    return () => clearTimeout(timer);
  }, [router, user]);

  if (!isClient || isSplashVisible) {
    return <SplashScreen />;
  }

  return null;
}
