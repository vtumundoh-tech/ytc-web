"use client";

import { useEffect, useState } from "react";
import type { AppSettings } from "@/lib/settings";
import { DEFAULT_SETTINGS } from "@/lib/settings";

export function useAppSettings(): { settings: AppSettings; loaded: boolean } {
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let active = true;
    fetch(`/api/settings?t=${Date.now()}`, { cache: "no-store" })
      .then((r) => r.json())
      .then((data) => {
        if (!active) return;
        if (data && Array.isArray(data.tiers)) {
          setSettings(data);
        }
      })
      .catch(() => {})
      .finally(() => {
        if (active) setLoaded(true);
      });
    return () => {
      active = false;
    };
  }, []);

  return { settings, loaded };
}
