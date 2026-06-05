import { motion } from 'framer-motion';

export default function Card({ children, hover = false, className = '', ...props }) {
  const Comp = hover ? motion.div : 'div';
  const animProps = hover
    ? { whileHover: { y: -4, boxShadow: '0 8px 24px rgba(0,0,0,0.12)' } }
    : {};
  return (
    <Comp className={`card ${className}`} {...animProps} {...props}>
      {children}
    </Comp>
  );
}
