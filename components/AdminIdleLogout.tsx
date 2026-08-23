"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

const IDLE_MS = 4 * 60 * 1000; // harus senada dengan batas idle di middleware

export default function AdminIdleLogout() {
  const router = useRouter();

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    const reset = () => {
      clearTimeout(timer);
      timer = setTimeout(async () => {
        await fetch("/api/admin-logout", { method: "POST" }).catch(() => null);
        router.push("/admin/login?reason=idle");
      }, IDLE_MS);
    };
    const events: Array<keyof WindowEventMap> = [
      "pointerdown",
      "keydown",
      "mousemove",
      "touchstart",
      "scroll",
    ];
    events.forEach((e) => window.addEventListener(e, reset, { passive: true }));
    reset();
    return () => {
      clearTimeout(timer);
      events.forEach((e) => window.removeEventListener(e, reset));
    };
  }, [router]);

  return null;
}
