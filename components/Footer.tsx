import { ShieldCheck } from "lucide-react";

export default function Footer() {
  return (
    <footer className="border-t border-gray-100 bg-white/50 mt-20">
      <div className="max-w-5xl mx-auto px-4 py-8 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2 text-xs text-gray-400">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>&copy; {new Date().getFullYear()} YouTube Clipper. All rights reserved.</span>
        </div>
        <div className="flex items-center gap-4 text-xs text-gray-400">
          <span className="hover:text-gray-600 cursor-pointer">Syarat & Ketentuan</span>
          <span className="hover:text-gray-600 cursor-pointer">Kebijakan Privasi</span>
        </div>
      </div>
    </footer>
  );
}
