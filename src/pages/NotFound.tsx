import { useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-indigo-900 via-slate-900 to-black text-white overflow-hidden relative">
      {/* Floating stars / dots */}
      <div className="absolute inset-0 -z-10">
        {[...Array(40)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-white rounded-full opacity-40 animate-pulse"
            style={{
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${2 + Math.random() * 3}s`,
            }}
          />
        ))}
      </div>

      {/* Animated 404 */}
      <motion.h1
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", duration: 0.8 }}
        className="text-[8rem] font-extrabold tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500 drop-shadow-lg"
      >
        404
      </motion.h1>

      {/* Subtext */}
      <motion.p
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="text-xl text-gray-300 mb-6"
      >
        Oops! Looks like you’re lost in space 🚀
      </motion.p>

      {/* Button */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
      >
        <Button
          onClick={() => (window.location.href = "/")}
          className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-2 rounded-full shadow-lg hover:shadow-xl hover:scale-105 transition-all"
        >
          Take Me Home
        </Button>
      </motion.div>

      {/* Decorative emoji / illustration */}
      <motion.div
        initial={{ opacity: 0, rotate: -15, y: 40 }}
        animate={{ opacity: 1, rotate: 0, y: 0 }}
        transition={{ delay: 1 }}
        className="mt-12 text-6xl"
      >
        🧑‍🚀
      </motion.div>
    </div>
  );
};

export default NotFound;
