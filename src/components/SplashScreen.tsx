import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

// Componente para os ícones flutuantes
const FloatingIcon: React.FC<{ 
  delay: number;
  x: number;
  y: number;
  children: React.ReactNode;
}> = ({ delay, x, y, children }) => (
  <motion.div
    initial={{ x, y, opacity: 0 }}
    animate={{
      x: [x, x + 50, x - 50, x],
      y: [y, y - 50, y + 50, y],
      opacity: [0, 1, 1, 0]
    }}
    transition={{
      duration: 8,
      delay,
      repeat: Infinity,
      ease: "linear"
    }}
    className="absolute text-white/20 text-4xl"
  >
    {children}
  </motion.div>
);

interface SplashScreenProps {
  onFinish: () => void;
}

const SplashScreen: React.FC<SplashScreenProps> = ({ onFinish }) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    // Timer para remover a splash screen após 4 segundos
    const timer = setTimeout(() => {
      setIsVisible(false);
      onFinish();
    }, 4000); // 4000ms = 4 segundos

    return () => clearTimeout(timer);
  }, [onFinish]);

  if (!isVisible) return null;

  return (
    <motion.div
      initial={{ opacity: 1 }}
      animate={{ opacity: isVisible ? 1 : 0 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 flex flex-col items-center justify-center bg-black overflow-hidden"
      style={{ zIndex: 9999 }}
    >
      {/* Ícones flutuantes de comida */}
      <FloatingIcon delay={0} x={-100} y={-100}>🍔</FloatingIcon>
      <FloatingIcon delay={1} x={100} y={-150}>🍟</FloatingIcon>
      <FloatingIcon delay={2} x={-150} y={100}>🥤</FloatingIcon>
      <FloatingIcon delay={3} x={150} y={100}>🍕</FloatingIcon>
      <FloatingIcon delay={4} x={0} y={-200}>🌮</FloatingIcon>
      <FloatingIcon delay={5} x={-200} y={0}>🥪</FloatingIcon>
      <FloatingIcon delay={2.5} x={200} y={-50}>🧃</FloatingIcon>
      <FloatingIcon delay={3.5} x={-50} y={200}>🍗</FloatingIcon>
      <motion.img
        src="/Faça seu pedido!.png"
        alt="Logo"
        className="w-32 h-32 rounded-full object-cover"
        initial={{ scale: 0.5, y: 0 }}
        animate={{ 
          scale: 1,
          y: [-20, 20]
        }}
        transition={{
          y: {
            duration: 1.5,
            repeat: Infinity,
            repeatType: "reverse",
            ease: "easeInOut"
          },
          scale: {
            duration: 0.5,
            ease: "easeOut"
          }
        }}
      />
      
      <motion.p
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 1 }}
        className="mt-6 text-xl font-semibold text-white"
      >
        Bem-vindo ao nosso cardápio
      </motion.p>
    </motion.div>
  );
};

export default SplashScreen;
