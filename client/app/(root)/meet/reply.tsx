import React from "react";
import { motion } from "framer-motion";

interface ReplyElementProps {
  content: string;
  timestamp: string;
  senderName: string;
}

const ReplyElement: React.FC<ReplyElementProps> = ({
  content,
  timestamp,
  senderName,
}) => {
  // Format timestamp
  const formattedTime = new Date(timestamp).toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit'
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="w-full px-4 py-1"
    >
      <motion.div
        className={`w-full rounded-lg bg-background p-4`}
        initial={{ scale: 0.95 }}
        animate={{ scale: 1 }}
        transition={{ duration: 0.2 }}
      >
        <div className="flex items-center gap-3 mb-2">
          <div className="w-8 h-8 rounded-full bg-gray-600 flex items-center justify-center text-white text-lg font-bold">
            {senderName.charAt(0).toUpperCase()}
          </div>
          <div className="flex items-center gap-2">
            <span className="font-medium text-gray-800 dark:text-gray-200">
              {senderName}
            </span>
            <span className="text-sm text-gray-500">{formattedTime}</span>
          </div>
        </div>
        <p className="text-gray-700 dark:text-gray-300 ml-11">{content}</p>
      </motion.div>
    </motion.div>
  );
};

export default ReplyElement;

