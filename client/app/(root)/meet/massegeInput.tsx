import { Button } from "@/components/ui/button";
import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2 } from "lucide-react";
import { useMessageStore } from "@/store/useMessage";

const MassegeInput = () => {
  const [message, setMessage] = useState("");
  const { addMessage, isLoading } = useMessageStore();

  const handleSendMessage = async () => {
    if (message.trim()) {
      await addMessage(message);
      setMessage("");
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="w-full flex items-center px-4 py-2 gap-3"
    >
      <motion.div
        initial={{ scale: 0.95 }}
        animate={{ scale: 1 }}
        className={`flex items-center flex-1 h-[70px] border rounded-lg bg-background px-4`}
      >
        <motion.input
          type="text"
          placeholder="Type your question"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleKeyPress}
          className="flex-1 bg-transparent border-none outline-none px-3"
          whileFocus={{ scale: 1.01 }}
          transition={{ duration: 0.2 }}
          disabled={isLoading}
        />

        <AnimatePresence mode="wait">
          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.95 }}>
            <Button
              onClick={handleSendMessage}
              className={`px-6 py-3 rounded-full font-medium transition-colors relative overflow-hidden
                ${
                  isLoading
                    ? "bg-[#218838]"
                    : "bg-[#28A745] hover:bg-[#218838]"
                }`}
              disabled={isLoading}
            >
              <motion.span
                initial={{ opacity: 1 }}
                animate={{ opacity: isLoading ? 0 : 1 }}
                exit={{ opacity: 0 }}
              >
                Send
              </motion.span>
              {isLoading && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 flex items-center justify-center"
                >
                  <Loader2 className="w-4 h-4 animate-spin" />
                </motion.div>
              )}
            </Button>
          </motion.div>
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
};

export default MassegeInput;
