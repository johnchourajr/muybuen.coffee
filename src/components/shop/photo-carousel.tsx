"use client";
import clsx from "clsx";
import { AnimatePresence, motion, PanInfo } from "motion/react";
import Image from "next/image";
import { useCallback, useEffect, useState } from "react";

interface PhotoCarouselProps {
  photos: string[];
  shopName: string;
  buentag?: "buen" | "shitlist";
  autoplayInterval?: number; // in milliseconds, default 4000
  enableAutoplay?: boolean; // default true
}

export const PhotoCarousel = ({
  photos,
  shopName,
  buentag,
  autoplayInterval = 4000,
  enableAutoplay = true,
}: PhotoCarouselProps) => {
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [direction, setDirection] = useState(0); // Track swipe direction

  const nextPhoto = useCallback(() => {
    setDirection(1);
    setCurrentPhotoIndex((prev) => (prev === photos.length - 1 ? 0 : prev + 1));
  }, [photos.length]);

  const previousPhoto = useCallback(() => {
    setDirection(-1);
    setCurrentPhotoIndex((prev) => (prev === 0 ? photos.length - 1 : prev - 1));
  }, [photos.length]);

  const goToPhoto = useCallback(
    (index: number) => {
      setDirection(index > currentPhotoIndex ? 1 : -1);
      setCurrentPhotoIndex(index);
    },
    [currentPhotoIndex],
  );

  // Autoplay functionality
  useEffect(() => {
    if (!enableAutoplay || photos.length <= 1 || isHovered || isDragging)
      return;

    const interval = setInterval(nextPhoto, autoplayInterval);
    return () => clearInterval(interval);
  }, [
    enableAutoplay,
    photos.length,
    isHovered,
    isDragging,
    nextPhoto,
    autoplayInterval,
  ]);

  // Handle drag gestures
  const handleDragEnd = (
    event: MouseEvent | TouchEvent | PointerEvent,
    info: PanInfo,
  ) => {
    setIsDragging(false);
    const threshold = 50;

    if (info.offset.x > threshold) {
      setDirection(-1);
      previousPhoto();
    } else if (info.offset.x < -threshold) {
      setDirection(1);
      nextPhoto();
    }
  };

  // Handle click to advance
  const handleImageClick = (event: React.MouseEvent) => {
    if (isDragging) return;

    const rect = event.currentTarget.getBoundingClientRect();
    const clickX = event.clientX - rect.left;
    const centerX = rect.width / 2;

    if (clickX > centerX) {
      setDirection(1);
      nextPhoto();
    } else {
      setDirection(-1);
      previousPhoto();
    }
  };

  return (
    <div
      className="relative select-none"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <motion.div
        className="relative aspect-square rounded-3xl overflow-hidden cursor-pointer bg-primary/5"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        <AnimatePresence initial={false} custom={direction}>
          <motion.div
            key={currentPhotoIndex}
            custom={direction}
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.2}
            onDragStart={() => setIsDragging(true)}
            onDragEnd={handleDragEnd}
            onClick={handleImageClick}
            variants={{
              enter: (direction: number) => ({
                x: direction > 0 ? "100%" : "-100%",
                opacity: 1,
              }),
              center: {
                x: "0%",
                opacity: 1,
                zIndex: 1,
              },
              exit: (direction: number) => ({
                x: direction > 0 ? "-100%" : "100%",
                opacity: 1,
                zIndex: 0,
              }),
            }}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{
              type: "tween",
              ease: "easeInOut",
              duration: 0.15,
            }}
            className="absolute inset-0 w-full h-full "
          >
            <Image
              src={photos[currentPhotoIndex]}
              alt={`${shopName} - Photo ${currentPhotoIndex + 1}`}
              fill
              className="object-cover pointer-events-none"
              sizes="(max-width: 1024px) 100vw, 50vw"
              priority={currentPhotoIndex === 0}
            />
          </motion.div>
        </AnimatePresence>

        {/* Progress indicator for autoplay */}
        {enableAutoplay && photos.length > 1 && !isHovered && !isDragging && (
          <motion.div
            className="absolute bottom-0 left-0 h-1 bg-white/70 rounded-full"
            initial={{ width: "0%" }}
            animate={{ width: "100%" }}
            transition={{ duration: autoplayInterval / 1000, ease: "linear" }}
            key={currentPhotoIndex}
          />
        )}
      </motion.div>

      {/* Photo dots/indicators */}
      {photos.length > 1 && (
        <motion.div
          className="flex justify-center items-center gap-2 mt-4 px-3 py-1.5 h-3 bg-white/10 backdrop-blur-sm rounded-full w-fit mx-auto"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05, duration: 0.15 }}
        >
          {photos.map((_, index) => (
            <motion.button
              key={index}
              onClick={() => goToPhoto(index)}
              className={clsx(
                "rounded-full transition-all",
                index === currentPhotoIndex
                  ? "w-6 h-3 bg-primary"
                  : "w-2.5 h-2.5 bg-primary/20 hover:bg-primary/30",
              )}
              aria-label={`Go to photo ${index + 1}`}
              whileHover={{ scale: 1.2 }}
              whileTap={{ scale: 0.9 }}
              layout
              transition={{
                type: "spring",
                stiffness: 400,
                damping: 25,
                duration: 0.1,
              }}
            />
          ))}
        </motion.div>
      )}
    </div>
  );
};
