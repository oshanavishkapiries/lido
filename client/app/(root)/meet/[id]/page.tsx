"use client";
import AvatarComponent from "@/components/AvatarComponent";
import { ModeToggle } from "@/components/ModeToggle";
import { Button } from "@/components/ui/button";
import { Copy } from "lucide-react";
import { toast } from "sonner";
import { Toaster } from "sonner";
import React from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { COLORS } from "@/constants/colors";
import MassegeInput from "../massegeInput";
import ReplyElement from "../reply";
import { useMessageStore } from "@/store/useMessage";
import Image from "next/image";
import { motion } from "framer-motion";
import { useParams } from "next/navigation";
import CancelMeeting from "../CancelMeeting";

const MeetPage = () => {
  const params = useParams();
  const meetingId = params.id as string;
  const messages = useMessageStore((state) => state.messages);

  const handleCopyId = () => {
    navigator.clipboard.writeText(meetingId);
    toast.success("Meeting ID copied to clipboard!");
  };


  return (
    <div className="min-h-screen flex flex-col w-full">
      <header
        className={`p-4 flex justify-between items-center w-full sticky top-0 z-50 border-b bg-white dark:bg-[${COLORS.background}]`}
      >
        <div className="w-full max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold">LIDO.</h1>
          </div>

          <div className="hidden md:flex items-center gap-4">
            <div className="flex items-center gap-2">
              <AvatarComponent name="John Doe" />
              <div className="flex flex-row items-center gap-2">
                <p className="text-sm font-medium">John Doe</p>
              </div>
            </div>
            <div className="flex items-center gap-2 bg-secondary px-3 py-1.5 rounded-md">
              <span className="text-sm font-medium">ID: {meetingId}</span>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 hover:bg-secondary/40"
                onClick={handleCopyId}
              >
                <Copy className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="md:hidden">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8 p-0">
                    <AvatarComponent name="John Doe" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuItem className="flex flex-col items-start gap-1">
                    <span className="text-sm font-medium">John Doe</span>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span>ID: {meetingId}</span>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-4 w-4 p-0 hover:bg-transparent"
                        onClick={handleCopyId}
                      >
                        <Copy className="h-3 w-3" />
                      </Button>
                    </div>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            <ModeToggle />
            <CancelMeeting>
              <Button
                variant="default"
                className="lg:px-10 lg:py-2 px-4 py-2 rounded-md bg-red-500 hover:bg-red-700 text-white"
              >
                Cancel
              </Button>
            </CancelMeeting>
          </div>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto pb-[100px]">
        <div className="w-full h-auto max-w-3xl mx-auto p-3 flex flex-col">
          {messages.length === 0 ? (
            <div className="w-full h-[calc(100vh-200px)] flex flex-col gap-4 items-center justify-center">
              <Image
                src="/hero/hero01.svg"
                className="w-1/4 aspect-square opacity-50"
                alt="logo"
                width={100}
                height={100}
              />
              <p className="text-muted-foreground">Start the conversation</p>
            </div>
          ) : (
            <div className="flex flex-col-reverse gap-2">
              {messages.map((msg) => (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <ReplyElement
                    message={msg.message}
                    timestamp={msg.timestamp}
                    username={msg.username}
                  />
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </main>

      <div className="w-full fixed bottom-0 left-0 right-0 backdrop-blur-sm">
        <div className="w-full h-auto max-w-4xl mx-auto p-3">
          <MassegeInput />
        </div>
      </div>

      <Toaster richColors position="top-center" />
    </div>
  );
};

export default MeetPage;
