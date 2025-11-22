"use client";

import { memo } from "react";
import { motion } from "framer-motion";

interface StreamChatProps {
  url: string;
}

export const StreamChat = memo(function StreamChat({ url }: StreamChatProps) {
  if (typeof window === "undefined") {
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="relative h-full w-full"
    >
      <iframe
        src={url}
        width="100%"
        height="100%"
        className="h-full w-full border-0"
        allow="autoplay; fullscreen"
      />
    </motion.div>
  );
});
