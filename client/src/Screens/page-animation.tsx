import { AnimatePresence, motion } from "framer-motion";

interface AnimationWrapperProps {
  children: React.ReactNode;
  keyValue?: string | number;
  initial?: { [key: string]: any };
  animate?: { [key: string]: any };
  transition?: { duration?: number; delay?: number };
  className?: string;
}
const AnimationWrapper: React.FC<AnimationWrapperProps> = ({
  children,
  keyValue,
  initial = { opacity: 0 },
  animate = { opacity: 1 },
  transition = { duration: 1 },
  className,
}) => {
  return (
    <AnimatePresence>
      <motion.div
        key={keyValue}
        initial={initial}
        animate={animate}
        transition={transition}
        className={className}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
};

export default AnimationWrapper;
