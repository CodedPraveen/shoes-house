"use client";

import { motion } from "framer-motion";

export default function SectionReveal({
  children,
  className = "",
  delay = 0,
  id,
}) {
  return (
    <motion.section
      id={id}
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.7, ease: [0.25, 1, 0.5, 1], delay }}
      className={className}
    >
      {children}
    </motion.section>
  );
}
