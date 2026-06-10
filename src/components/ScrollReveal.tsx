"use client";

import React, { useEffect, useRef, useState } from "react";

interface ScrollRevealProps {
  children: React.ReactNode;
  className?: string;
  delay?: number; // ms
  duration?: number; // ms
  animation?: "fadeInUp" | "fadeIn" | "scaleUp" | "slideInLeft" | "slideInRight";
}

export default function ScrollReveal({
  children,
  className = "",
  delay = 0,
  duration = 800,
  animation = "fadeInUp",
}: ScrollRevealProps) {
  const [isVisible, setIsVisible] = useState(false);
  const elementRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // If the browser doesn't support IntersectionObserver, reveal immediately
    if (typeof window === "undefined" || !("IntersectionObserver" in window)) {
      setIsVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(entry.target);
        }
      },
      {
        threshold: 0.1,
        rootMargin: "0px 0px -40px 0px", // triggers slightly before entering the screen
      }
    );

    const currentRef = elementRef.current;
    if (currentRef) {
      observer.observe(currentRef);
    }

    return () => {
      if (currentRef) {
        observer.unobserve(currentRef);
      }
      observer.disconnect();
    };
  }, []);

  const getAnimationClass = () => {
    switch (animation) {
      case "fadeIn":
        return isVisible ? "opacity-100" : "opacity-0";
      case "scaleUp":
        return isVisible ? "opacity-100 scale-100" : "opacity-0 scale-95";
      case "slideInLeft":
        return isVisible ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-8";
      case "slideInRight":
        return isVisible ? "opacity-100 translate-x-0" : "opacity-0 translate-x-8";
      case "fadeInUp":
      default:
        return isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8";
    }
  };

  return (
    <div
      ref={elementRef}
      className={`transition-all ease-[cubic-bezier(0.16,1,0.3,1)] ${getAnimationClass()} ${className}`}
      style={{
        transitionDuration: `${duration}ms`,
        transitionDelay: `${delay}ms`,
      }}
    >
      {children}
    </div>
  );
}
