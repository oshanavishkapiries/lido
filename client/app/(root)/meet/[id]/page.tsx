"use client";
import AvatarComponent from "@/components/AvatarComponent";
import { ModeToggle } from "@/components/ModeToggle";
import { Button } from "@/components/ui/button";
import { Copy, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Toaster } from "sonner";
import React, { useEffect, useState, useRef } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import MassegeInput from "../massegeInput";
import ReplyElement from "../reply";
import { useMessageStore } from "@/store/useMessage";
import Image from "next/image";
import { motion } from "framer-motion";
import { useParams, useRouter } from "next/navigation";
import CancelMeeting from "../CancelMeeting";
import { getSessionById } from "@/api/getSessionById";
import useSession from "@/store/useSession";
import { useUserStore } from "@/store/useUserStore";
import { useSessionSocket } from "@/hooks/useSessionSocket";
import { useParticipantStore } from "@/store/useParticipantStore";
import { getMessages } from "@/api/getMessages";

const MeetPage = () => {
  const params = useParams();
  const meetingId = params.id as string;
  const router = useRouter();

  const { getSession, setSession } = useSession();
  const session = getSession(meetingId);

  const { userName, setUserName } = useUserStore();
  const messages = useMessageStore((state) => state.messages);
  const isLoadingMessages = useMessageStore((state) => state.isLoading);
  const hasMoreMessages = useMessageStore((state) => state.hasMore);
  const participants = useParticipantStore((state) => state.participants);

  const [showNameDialog, setShowNameDialog] = useState(false);
  const [tempName, setTempName] = useState("");
  const [isLoadingSession, setIsLoadingSession] = useState(true);

  // Refs for scroll management
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const previousMessageCountRef = useRef(0);

  // Socket.io integration
  const { sendMessage, sendTyping, sendStopTyping, isConnected } = useSessionSocket({
    sessionId: meetingId,
    onJoined: () => {
      setShowNameDialog(false);
    },
  });

  // Fetch session details
  useEffect(() => {
    const fetchSession = async () => {
      try {
        const sessionData = await getSessionById(meetingId);
        if (sessionData.status !== "success" || !sessionData.data.isActive) {
          toast.error("Session not found or inactive");
          router.push("/");
          return;
        }
        setSession(sessionData.data);
      } catch (error) {
        console.error("Error fetching session:", error);
        toast.error("Failed to load session");
        router.push("/");
      } finally {
        setIsLoadingSession(false);
      }
    };
    fetchSession();
  }, [meetingId, setSession, router]);

  // Clear messages when leaving session
  useEffect(() => {
    const clearMessages = useMessageStore.getState().clearMessages;
    return () => {
      clearMessages();
    };
  }, []);

  // Auto-scroll to bottom when new message arrives
  useEffect(() => {
    // Only scroll if a new message was added (not on initial load or load more)
    if (messages.length > previousMessageCountRef.current) {
      scrollToBottom();
    }
    previousMessageCountRef.current = messages.length;
  }, [messages]);

  // Scroll to bottom on initial load
  useEffect(() => {
    if (messages.length > 0 && previousMessageCountRef.current === 0) {
      scrollToBottom('auto');
    }
  }, [messages.length]);

  // Check if user has a name, if not show dialog
  useEffect(() => {
    if (!isLoadingSession && !userName) {
      setShowNameDialog(true);
    }
  }, [userName, isLoadingSession]);

  const scrollToBottom = (behavior: ScrollBehavior = 'smooth') => {
    messagesEndRef.current?.scrollIntoView({ behavior });
  };

  const handleNameSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (tempName.trim()) {
      setUserName(tempName.trim());
      setShowNameDialog(false);
    }
  };

  const handleCopyId = () => {
    navigator.clipboard.writeText(meetingId);
    toast.success("Meeting ID copied to clipboard!");
  };

  if (isLoadingSession) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading session...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col w-full">
      {/* User Name Dialog */}
      <Dialog open={showNameDialog} onOpenChange={setShowNameDialog}>
        <DialogContent className="bg-background">
          <DialogHeader>
            <DialogTitle>Enter Your Name</DialogTitle>
            <DialogDescription>
              Please enter your name to join the session
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleNameSubmit} className="space-y-4">
            <div>
              <Label htmlFor="userName">Your Name</Label>
              <Input
                id="userName"
                value={tempName}
                onChange={(e) => setTempName(e.target.value)}
                placeholder="Enter your name"
                required
                autoFocus
              />
            </div>
            <Button type="submit" className="w-full">
              Join Session
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      <header
        className={`p-4 flex justify-between items-center w-full sticky top-0 z-50 border-b bg-background`}
      >
        <div className="w-full max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold">LIDO.</h1>
            {!isConnected && (
              <span className="text-xs text-yellow-500">Connecting...</span>
            )}
          </div>

          <div className="hidden md:flex items-center gap-4">
            <div className="flex items-center gap-2">
              <AvatarComponent name={session?.sessionName} />
              <div className="flex flex-row items-center gap-2">
                <p className="text-sm font-medium">{session?.sessionName}</p>
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
            <div className="text-sm text-muted-foreground">
              {participants.length} participant{participants.length !== 1 ? 's' : ''}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="md:hidden">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8 p-0">
                    <AvatarComponent name={session?.sessionName} />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuItem className="flex flex-col items-start gap-1">
                    <span className="text-sm font-medium">
                      {session?.sessionName}
                    </span>
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
            <CancelMeeting meetingId={meetingId}>
              <Button
                variant="default"
                className="lg:px-10 lg:py-2 px-4 py-2 rounded-md bg-red-500 hover:bg-red-700 text-white"
              >
                End
              </Button>
            </CancelMeeting>
          </div>
        </div>
      </header>

      {/* Messages Container */}
      <main
        ref={messagesContainerRef}
        className="flex-1 overflow-y-auto"
        style={{ paddingBottom: '100px' }}
      >
        <div className="w-full max-w-3xl mx-auto p-4">
          {/* Loading indicator for older messages */}
          {isLoadingMessages && hasMoreMessages && messages.length > 0 && (
            <div className="flex justify-center py-4">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span className="text-sm">Loading older messages...</span>
              </div>
            </div>
          )}

          {messages.length === 0 ? (
            <div className="flex flex-col gap-4 items-center justify-center h-[calc(100vh-300px)]">
              <Image
                src="/hero/hero01.svg"
                className="w-1/4 aspect-square opacity-50"
                alt="logo"
                width={100}
                height={100}
              />
              <p className="text-muted-foreground">No messages yet. Start the conversation!</p>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {messages.map((msg, index) => (
                <motion.div
                  key={msg.id || `message-${index}`}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <ReplyElement
                    content={msg.content}
                    timestamp={msg.timestamp}
                    senderName={msg.senderName}
                  />
                </motion.div>
              ))}
              {/* Invisible element to scroll to */}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>
      </main>

      {/* Message Input - Fixed at bottom */}
      <div className="w-full fixed bottom-0 left-0 right-0 bg-background border-t">
        <div className="w-full max-w-4xl mx-auto p-3">
          <MassegeInput
            sendMessage={sendMessage}
            sendTyping={sendTyping}
            sendStopTyping={sendStopTyping}
            isConnected={isConnected}
          />
        </div>
      </div>

      <Toaster richColors position="top-center" />
    </div>
  );
};

export default MeetPage;
