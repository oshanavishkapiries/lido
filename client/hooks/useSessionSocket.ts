import { useEffect, useRef, useMemo } from "react";
import { useSocket } from "@/contexts/SocketContext";
import { useUserStore } from "@/store/useUserStore";
import {
  createSocketEventHandlers,
  registerSocketListeners,
  unregisterSocketListeners,
} from "./socketEventHandlers";
import { createSocketActions } from "./socketActions";

interface UseSessionSocketProps {
  sessionId: string;
  onJoined?: () => void;
}

/**
 * Main hook for managing Socket.io session connection
 * Handles joining, leaving, and all real-time communication
 */
export const useSessionSocket = ({
  sessionId,
  onJoined,
}: UseSessionSocketProps) => {
  const { socket, isConnected } = useSocket();
  const { userName } = useUserStore();
  const hasJoined = useRef(false);

  // Memoize socket actions to prevent recreation on every render
  const actions = useMemo(
    () => createSocketActions(socket, sessionId, userName),
    [socket, sessionId, userName]
  );

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
    socket.emit("join-session", { sessionId, userName });
    hasJoined.current = true;
  }, [socket, isConnected, sessionId, userName]); // Removed actions from dependencies

  // Setup event listeners
  useEffect(() => {
    if (!socket) return;

    const handlers = createSocketEventHandlers(sessionId, onJoined);
    registerSocketListeners(socket, handlers);

    // Cleanup
    return () => {
      unregisterSocketListeners(socket, handlers);
    };
  }, [socket, sessionId, onJoined]);

  // Leave session on unmount
  useEffect(() => {
    return () => {
      if (socket && userName && sessionId && hasJoined.current) {
        console.log(`👋 Leaving session ${sessionId}`);
        socket.emit("leave-session", { sessionId, userName });
        hasJoined.current = false;
      }
    };
  }, [socket, sessionId, userName]); // Removed actions from dependencies

  return {
    sendMessage: actions.sendMessage,
    sendTyping: actions.sendTyping,
    sendStopTyping: actions.sendStopTyping,
    isConnected,
  };
};
