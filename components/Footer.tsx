"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ShieldCheck } from "lucide-react";
import { GATE_PATH } from "@/lib/gate";

export default function Footer() {
  const pathname = usePathname();
  const showGate = pathname !== GATE_PATH;

  return (
    <footer className="relative border-t border-gray-100 bg-white/50 mt-20">
      <div className="max-w-5xl mx-auto px-4 py-8 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2 text-xs text-gray-400">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>&copy; {new Date().getFullYear()} Mineclip Studio. All rights reserved.</span>
        </div>
        <div className="flex items-center gap-4 text-xs text-gray-400">
          <Link href="/syarat-ketentuan" className="hover:text-gray-600">Terms & Conditions</Link>
          <Link href="/syarat-ketentuan#privacy-policy" className="hover:text-gray-600">Kebijakan Privasi</Link>
        </div>
      </div>
      {showGate && (
        <Link
          href={GATE_PATH}
          aria-label="."
          className="absolute bottom-3 right-4 inline-block w-2 h-2 rounded-full bg-gray-300 hover:bg-gray-400 transition-colors"
        />
      )}
    </footer>
  );
}
