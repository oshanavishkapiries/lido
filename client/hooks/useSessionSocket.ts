import { useEffect, useRef } from "react";
import { useSocket } from "@/contexts/SocketContext";
import { useMessageStore, Message } from "@/store/useMessage";
import { useParticipantStore } from "@/store/useParticipantStore";
import { useUserStore } from "@/store/useUserStore";
import { toast } from "sonner";

interface UseSessionSocketProps {
  sessionId: string;
  onJoined?: () => void;
}

export const useSessionSocket = ({
  sessionId,
  onJoined,
}: UseSessionSocketProps) => {
  const { socket, isConnected } = useSocket();
  const { userName } = useUserStore();
  const {
    addMessage,
    setMessages,
    updateMessageReactions,
    updateMessageUpvotes,
  } = useMessageStore();
  const { setParticipants } = useParticipantStore();
  const hasJoined = useRef(false);

  // Join session when socket connects
  useEffect(() => {
    if (
      !socket ||
      !isConnected ||
      !userName ||
      !sessionId ||
      hasJoined.current
    ) {
      return;
    }

    console.log(`🔌 Joining session ${sessionId} as ${userName}`);

    socket.emit("join-session", {
      sessionId,
      userName,
    });

    hasJoined.current = true;
  }, [socket, isConnected, sessionId, userName]);

  // Setup event listeners
  useEffect(() => {
    if (!socket) return;

    // Successfully joined session
    const handleJoinedSession = (data: any) => {
      console.log("✅ Joined session:", data);
      setParticipants(data.participants);
      toast.success(`Welcome to the session, ${data.userName}!`);
      onJoined?.();
    };

    // New message received
    const handleNewMessage = (message: Message) => {
      console.log("📨 New message:", message);
      addMessage(message);
    };

    // Participant joined
    const handleParticipantJoined = (data: any) => {
      console.log("👋 Participant joined:", data.userName);
      setParticipants(data.participants);
      toast.info(`${data.userName} joined the session`);
    };

    // Participant left
    const handleParticipantLeft = (data: any) => {
      console.log("👋 Participant left:", data.userName);
      setParticipants(data.participants);
      toast.info(`${data.userName} left the session`);
    };

    // Typing indicators
    const handleUserTyping = (data: { userName: string }) => {
      console.log("⌨️ User typing:", data.userName);
      // You can implement typing indicator UI here
    };

    const handleUserStopTyping = (data: { userName: string }) => {
      console.log("⌨️ User stopped typing:", data.userName);
      // You can implement typing indicator UI here
    };

    // Reactions
    const handleReactionAdded = (data: {
      messageId: string;
      reactions: any[];
    }) => {
      console.log("👍 Reaction added:", data);
      updateMessageReactions(data.messageId, data.reactions);
    };

    // Upvotes
    const handleMessageUpvoted = (data: {
      messageId: string;
      upvotes: any;
    }) => {
      console.log("⬆️ Message upvoted:", data);
      updateMessageUpvotes(data.messageId, data.upvotes);
    };

    // Error handling
    const handleError = (error: { message: string }) => {
      console.error("❌ Socket error:", error);
      toast.error(error.message);
    };

    // Register event listeners
    socket.on("joined-session", handleJoinedSession);
    socket.on("new-message", handleNewMessage);
    socket.on("participant-joined", handleParticipantJoined);
    socket.on("participant-left", handleParticipantLeft);
    socket.on("user-typing", handleUserTyping);
    socket.on("user-stop-typing", handleUserStopTyping);
    socket.on("reaction-added", handleReactionAdded);
    socket.on("message-upvoted", handleMessageUpvoted);
    socket.on("error", handleError);

    // Cleanup
    return () => {
      socket.off("joined-session", handleJoinedSession);
      socket.off("new-message", handleNewMessage);
      socket.off("participant-joined", handleParticipantJoined);
      socket.off("participant-left", handleParticipantLeft);
      socket.off("user-typing", handleUserTyping);
      socket.off("user-stop-typing", handleUserStopTyping);
      socket.off("reaction-added", handleReactionAdded);
      socket.off("message-upvoted", handleMessageUpvoted);
      socket.off("error", handleError);
    };
  }, [
    socket,
    addMessage,
    setParticipants,
    updateMessageReactions,
    updateMessageUpvotes,
    onJoined,
  ]);

  // Leave session on unmount
  useEffect(() => {
    return () => {
      if (socket && userName && sessionId && hasJoined.current) {
        console.log(`👋 Leaving session ${sessionId}`);
        socket.emit("leave-session", {
          sessionId,
          userName,
        });
        hasJoined.current = false;
      }
    };
  }, [socket, sessionId, userName]);

  // Send message function
  const sendMessage = (
    content: string,
    type: "message" | "question" | "announcement" = "message"
  ) => {
    if (!socket || !userName || !sessionId) {
      toast.error("Cannot send message: Not connected");
      return;
    }

    socket.emit("send-message", {
      sessionId,
      userName,
      message: content,
      type,
    });
  };

  // Typing indicators
  const sendTyping = () => {
    if (!socket || !userName || !sessionId) return;
    socket.emit("typing", { sessionId, userName });
  };

  const sendStopTyping = () => {
    if (!socket || !userName || !sessionId) return;
    socket.emit("stop-typing", { sessionId, userName });
  };

  return {
    sendMessage,
    sendTyping,
    sendStopTyping,
    isConnected,
  };
};
