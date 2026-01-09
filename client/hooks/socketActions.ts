import { Socket } from "socket.io-client";
import { toast } from "sonner";

/**
 * Socket actions for sending events to the server
 */
export const createSocketActions = (
  socket: Socket | null,
  sessionId: string,
  userName: string | null
) => {
  /**
   * Send a message to the session
   */
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

  /**
   * Send typing indicator
   */
  const sendTyping = () => {
    if (!socket || !userName || !sessionId) return;
    socket.emit("typing", { sessionId, userName });
  };

  /**
   * Send stop typing indicator
   */
  const sendStopTyping = () => {
    if (!socket || !userName || !sessionId) return;
    socket.emit("stop-typing", { sessionId, userName });
  };

  /**
   * Join a session
   */
  const joinSession = () => {
    if (!socket || !userName || !sessionId) return;

    console.log(`🔌 Joining session ${sessionId} as ${userName}`);
    socket.emit("join-session", {
      sessionId,
      userName,
    });
  };

  /**
   * Leave a session
   */
  const leaveSession = () => {
    if (!socket || !userName || !sessionId) return;

    console.log(`👋 Leaving session ${sessionId}`);
    socket.emit("leave-session", {
      sessionId,
      userName,
    });
  };

  return {
    sendMessage,
    sendTyping,
    sendStopTyping,
    joinSession,
    leaveSession,
  };
};
