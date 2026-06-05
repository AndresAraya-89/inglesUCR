import { motion } from 'framer-motion';

/**
 * Botón base con variantes y micro-animación de pulsación (RNF-06).
 * variant: 'primary' | 'secondary' | 'ghost' | 'danger'
 */
export default function Button({
  children,
  variant = 'primary',
  type = 'button',
  disabled = false,
  full = false,
  ...props
}) {
  return (
    <motion.button
      type={type}
      disabled={disabled}
      whileTap={disabled ? undefined : { scale: 0.96 }}
      className={`btn btn--${variant}${full ? ' btn--full' : ''}`}
      {...props}
    >
      {children}
    </motion.button>
  );
}
