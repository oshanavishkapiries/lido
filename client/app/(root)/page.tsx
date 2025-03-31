"use client";
import { ModeToggle } from "@/components/ModeToggle";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Github } from "lucide-react";
import { Toaster } from "sonner";
import Hero from "./hero";
import CreateMeet from "./CreateMeet";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col w-full max-w-7xl mx-auto">
      {/* Header */}
      <header className="p-4 flex justify-between items-center fixed top-0 z-50 w-full max-w-7xl mx-auto">
        <div className="flex items-center gap-2">
          <Image
            src="/logo/LIDO.png"
            alt="logo"
            width={70}
            height={30}
            className=""
          />
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            className="hover:bg-gray-100"
            onClick={() =>
              window.open(
                "https://github.com/oshanavishkapiries/lido",
                "_blank"
              )
            }
          >
            <Github className="w-4 h-4" />
          </Button>
          <ModeToggle />
          <CreateMeet>
            <Button variant="default" className="hover:bg-gray-100">
              CREATE +
            </Button>
          </CreateMeet>
        </div>
      </header>

      <Hero />

      {/* Sonner Toast */}
      <Toaster richColors position="top-center" />
    </div>
  );
}
