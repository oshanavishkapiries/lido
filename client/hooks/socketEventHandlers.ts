import { Socket } from "socket.io-client";
import { useMessageStore, Message } from "@/store/useMessage";
import { useParticipantStore } from "@/store/useParticipantStore";
import { toast } from "sonner";
import { getMessages } from "@/api/getMessages";

/**
 * Socket event handlers
 * Handles all incoming Socket.io events
 */
export const createSocketEventHandlers = (
  sessionId: string,
  onJoined?: () => void
) => {
  const {
    addMessage,
    setMessages,
    updateMessageReactions,
    updateMessageUpvotes,
  } = useMessageStore.getState();
  const { setParticipants } = useParticipantStore.getState();

  return {
    // Successfully joined session
    handleJoinedSession: async (data: any) => {
      console.log("✅ Joined session:", data);
      setParticipants(data.participants);

      // Load initial message history (latest messages)
      try {
        console.log("📜 Loading message history...");
        const response = await getMessages(sessionId, 20, 0);

        if (response.status === "success" && response.data.messages) {
          const messages = response.data.messages;
          const totalCount = response.data.pagination?.total || 0;
          const hasMore = messages.length < totalCount;

          setMessages(messages);

          // Update hasMore flag
          const messageStore = useMessageStore.getState();
          messageStore.resetPagination();
          if (!hasMore) {
            messageStore.setLoading(false);
          }

          console.log(
            `✅ Loaded ${messages.length} messages (${totalCount} total, hasMore: ${hasMore})`
          );
        }
      } catch (error) {
        console.error("Failed to load message history:", error);
      }

      toast.success(`Welcome to the session, ${data.userName}!`);
      onJoined?.();
    },

    // New message received
    handleNewMessage: (message: Message) => {
      console.log("📨 New message:", message);
      addMessage(message);
    },

    // Participant joined
    handleParticipantJoined: (data: any) => {
      console.log("👋 Participant joined:", data.userName);
      setParticipants(data.participants);
      toast.info(`${data.userName} joined the session`);
    },

    // Participant left
    handleParticipantLeft: (data: any) => {
      console.log("👋 Participant left:", data.userName);
      setParticipants(data.participants);
      toast.info(`${data.userName} left the session`);
    },

    // Typing indicators
    handleUserTyping: (data: { userName: string }) => {
      console.log("⌨️ User typing:", data.userName);
      // Can be extended with typing indicator UI
    },

    handleUserStopTyping: (data: { userName: string }) => {
      console.log("⌨️ User stopped typing:", data.userName);
      // Can be extended with typing indicator UI
    },

    // Reactions
    handleReactionAdded: (data: { messageId: string; reactions: any[] }) => {
      console.log("👍 Reaction added:", data);
      updateMessageReactions(data.messageId, data.reactions);
    },

    // Upvotes
    handleMessageUpvoted: (data: { messageId: string; upvotes: any }) => {
      console.log("⬆️ Message upvoted:", data);
      updateMessageUpvotes(data.messageId, data.upvotes);
    },

    // Error handling
    handleError: (error: { message: string }) => {
      console.error("❌ Socket error:", error);
      toast.error(error.message);
    },
  };
};

/**
 * Register all socket event listeners
 */
export const registerSocketListeners = (
  socket: Socket,
  handlers: ReturnType<typeof createSocketEventHandlers>
) => {
  socket.on("joined-session", handlers.handleJoinedSession);
  socket.on("new-message", handlers.handleNewMessage);
  socket.on("participant-joined", handlers.handleParticipantJoined);
  socket.on("participant-left", handlers.handleParticipantLeft);
  socket.on("user-typing", handlers.handleUserTyping);
  socket.on("user-stop-typing", handlers.handleUserStopTyping);
  socket.on("reaction-added", handlers.handleReactionAdded);
  socket.on("message-upvoted", handlers.handleMessageUpvoted);
  socket.on("error", handlers.handleError);
};

/**
 * Unregister all socket event listeners
 */
export const unregisterSocketListeners = (
  socket: Socket,
  handlers: ReturnType<typeof createSocketEventHandlers>
) => {
  socket.off("joined-session", handlers.handleJoinedSession);
  socket.off("new-message", handlers.handleNewMessage);
  socket.off("participant-joined", handlers.handleParticipantJoined);
  socket.off("participant-left", handlers.handleParticipantLeft);
  socket.off("user-typing", handlers.handleUserTyping);
  socket.off("user-stop-typing", handlers.handleUserStopTyping);
  socket.off("reaction-added", handlers.handleReactionAdded);
  socket.off("message-upvoted", handlers.handleMessageUpvoted);
  socket.off("error", handlers.handleError);
};
