/* eslint-disable no-constant-condition */
"use client";

import { FaStar } from "react-icons/fa";
import { useState, useEffect, useRef, useCallback, useMemo } from "react";

type Testimonial = {
  name: string;
  role: string;
  image: string;
  content: string;
};

type TestimonialsSectionProps = {
  testimonials: Testimonial[];
};

const ANIMATION_CONFIG = {
  SMOOTH_TAU: 0.25,
  MIN_COPIES: 2,
  COPY_HEADROOM: 2,
} as const;

const useResizeObserver = (
  callback: () => void,
  elements: Array<React.RefObject<Element | null>>,
  dependencies: React.DependencyList
) => {
  useEffect(() => {
    if (!window.ResizeObserver) {
      const handleResize = () => callback();
      window.addEventListener("resize", handleResize);
      callback();
      return () => window.removeEventListener("resize", handleResize);
    }

    const observers = elements.map((ref) => {
      if (!ref.current) return null;
      const observer = new ResizeObserver(callback);
      observer.observe(ref.current);
      return observer;
    });

    callback();

    return () => {
      observers.forEach((observer) => observer?.disconnect());
    };
  }, dependencies);
};

const useAnimationLoop = (
  trackRef: React.RefObject<HTMLDivElement | null>,
  targetVelocity: number,
  seqWidth: number,
  isHovered: boolean,
  pauseOnHover: boolean
) => {
  const rafRef = useRef<number | null>(null);
  const lastTimestampRef = useRef<number | null>(null);
  const offsetRef = useRef(0);
  const velocityRef = useRef(0);

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;

    const prefersReduced =
      typeof window !== "undefined" &&
      window.matchMedia &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (seqWidth > 0) {
      offsetRef.current =
        ((offsetRef.current % seqWidth) + seqWidth) % seqWidth;
      track.style.transform = `translate3d(${-offsetRef.current}px, 0, 0)`;
    }

    if (prefersReduced) {
      track.style.transform = "translate3d(0, 0, 0)";
      return () => {
        lastTimestampRef.current = null;
      };
    }

    const animate = (timestamp: number) => {
      if (lastTimestampRef.current === null) {
        lastTimestampRef.current = timestamp;
      }

      const deltaTime =
        Math.max(0, timestamp - lastTimestampRef.current) / 1000;
      lastTimestampRef.current = timestamp;

      const target = pauseOnHover && isHovered ? 0 : targetVelocity;

      const easingFactor =
        1 - Math.exp(-deltaTime / ANIMATION_CONFIG.SMOOTH_TAU);
      velocityRef.current += (target - velocityRef.current) * easingFactor;

      if (seqWidth > 0) {
        let nextOffset = offsetRef.current + velocityRef.current * deltaTime;
        nextOffset = ((nextOffset % seqWidth) + seqWidth) % seqWidth;
        offsetRef.current = nextOffset;

        const translateX = -offsetRef.current;
        track.style.transform = `translate3d(${translateX}px, 0, 0)`;
      }

      rafRef.current = requestAnimationFrame(animate);
    };

    rafRef.current = requestAnimationFrame(animate);

    return () => {
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
      lastTimestampRef.current = null;
    };
  }, [targetVelocity, seqWidth, isHovered, pauseOnHover]);
};

export default function TestimonialsSection({
  testimonials,
}: TestimonialsSectionProps) {
  const [cardWidth, setCardWidth] = useState("w-80");

  // Refs untuk row pertama
  const row1ContainerRef = useRef<HTMLDivElement>(null);
  const row1TrackRef = useRef<HTMLDivElement>(null);
  const row1SeqRef = useRef<HTMLDivElement>(null);
  const [row1SeqWidth, setRow1SeqWidth] = useState<number>(0);
  const [row1CopyCount, setRow1CopyCount] = useState<number>(
    ANIMATION_CONFIG.MIN_COPIES
  );
  const [row1Hovered, setRow1Hovered] = useState<boolean>(false);

  // Refs untuk row kedua
  const row2ContainerRef = useRef<HTMLDivElement>(null);
  const row2TrackRef = useRef<HTMLDivElement>(null);
  const row2SeqRef = useRef<HTMLDivElement>(null);
  const [row2SeqWidth, setRow2SeqWidth] = useState<number>(0);
  const [row2CopyCount, setRow2CopyCount] = useState<number>(
    ANIMATION_CONFIG.MIN_COPIES
  );
  const [row2Hovered, setRow2Hovered] = useState<boolean>(false);

  // Adjust card width based on screen size
  useEffect(() => {
    const updateCardWidth = () => {
      if (window.innerWidth < 640) {
        setCardWidth("w-72");
      } else if (window.innerWidth < 768) {
        setCardWidth("w-80");
      } else if (window.innerWidth < 1024) {
        setCardWidth("w-96");
      } else {
        setCardWidth("w-80");
      }
    };

    updateCardWidth();
    window.addEventListener("resize", updateCardWidth);
    return () => window.removeEventListener("resize", updateCardWidth);
  }, []);

  // Membagi testimonials menjadi 2 bagian untuk 2 row
  const firstRow = testimonials.slice(0, Math.ceil(testimonials.length / 2));
  const secondRow = testimonials.slice(Math.ceil(testimonials.length / 2));

  // Animasi settings
  const row1Speed = -60; // ke kiri
  const row2Speed = 60; // ke kanan
  const pauseOnHover = true;

  const row1TargetVelocity = useMemo(() => {
    const magnitude = Math.abs(row1Speed);
    const directionMultiplier = "left" === "left" ? 1 : -1;
    const speedMultiplier = row1Speed < 0 ? -1 : 1;
    return magnitude * directionMultiplier * speedMultiplier;
  }, [row1Speed]);

  const row2TargetVelocity = useMemo(() => {
    const magnitude = Math.abs(row2Speed);
    const directionMultiplier = "right" === "right" ? 1 : -1;
    const speedMultiplier = row2Speed < 0 ? -1 : 1;
    return magnitude * directionMultiplier * speedMultiplier;
  }, [row2Speed]);

  // Update dimensions untuk row 1
  const updateRow1Dimensions = useCallback(() => {
    const containerWidth = row1ContainerRef.current?.clientWidth ?? 0;
    const sequenceWidth =
      row1SeqRef.current?.getBoundingClientRect?.()?.width ?? 0;

    if (sequenceWidth > 0) {
      setRow1SeqWidth(Math.ceil(sequenceWidth));
      const copiesNeeded =
        Math.ceil(containerWidth / sequenceWidth) +
        ANIMATION_CONFIG.COPY_HEADROOM;
      setRow1CopyCount(Math.max(ANIMATION_CONFIG.MIN_COPIES, copiesNeeded));
    }
  }, []);

  // Update dimensions untuk row 2
  const updateRow2Dimensions = useCallback(() => {
    const containerWidth = row2ContainerRef.current?.clientWidth ?? 0;
    const sequenceWidth =
      row2SeqRef.current?.getBoundingClientRect?.()?.width ?? 0;

    if (sequenceWidth > 0) {
      setRow2SeqWidth(Math.ceil(sequenceWidth));
      const copiesNeeded =
        Math.ceil(containerWidth / sequenceWidth) +
        ANIMATION_CONFIG.COPY_HEADROOM;
      setRow2CopyCount(Math.max(ANIMATION_CONFIG.MIN_COPIES, copiesNeeded));
    }
  }, []);

  useResizeObserver(
    updateRow1Dimensions,
    [row1ContainerRef, row1SeqRef],
    [firstRow, cardWidth]
  );
  useResizeObserver(
    updateRow2Dimensions,
    [row2ContainerRef, row2SeqRef],
    [secondRow, cardWidth]
  );

  useAnimationLoop(
    row1TrackRef,
    row1TargetVelocity,
    row1SeqWidth,
    row1Hovered,
    pauseOnHover
  );
  useAnimationLoop(
    row2TrackRef,
    row2TargetVelocity,
    row2SeqWidth,
    row2Hovered,
    pauseOnHover
  );

  const handleRow1MouseEnter = useCallback(() => {
    if (pauseOnHover) setRow1Hovered(true);
  }, [pauseOnHover]);

  const handleRow1MouseLeave = useCallback(() => {
    if (pauseOnHover) setRow1Hovered(false);
  }, [pauseOnHover]);

  const handleRow2MouseEnter = useCallback(() => {
    if (pauseOnHover) setRow2Hovered(true);
  }, [pauseOnHover]);

  const handleRow2MouseLeave = useCallback(() => {
    if (pauseOnHover) setRow2Hovered(false);
  }, [pauseOnHover]);

  // Card testimonial component
  const TestimonialCard = ({
    testimonial,
    index,
  }: {
    testimonial: Testimonial;
    index: number;
  }) => (
    <div
      className={`flex-shrink-0 ${cardWidth} bg-background dark:bg-black p-4 sm:p-6 rounded-xl border border-border shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1 sm:hover:-translate-y-2 mx-2 sm:mx-5`}
    >
      <div className="flex items-center mb-3 sm:mb-4">
        <div className="flex-shrink-0">
          <img
            className="h-10 w-10 sm:h-12 sm:w-12 rounded-full object-cover border-2 border-primary/10"
            src={testimonial.image}
            alt={testimonial.name}
          />
        </div>
        <div className="ml-3">
          <h3 className="text-sm sm:text-base font-medium text-foreground font-sans">
            {testimonial.name}
          </h3>
          <p className="text-xs sm:text-sm text-primary font-medium font-sans">
            {testimonial.role}
          </p>
        </div>
      </div>
      <div className="flex mb-2 sm:mb-3 space-x-1">
        {[...Array(5)].map((_, i) => (
          <FaStar key={i} className="text-yellow-400 text-xs sm:text-sm" />
        ))}
      </div>
      <p className="text-xs sm:text-sm text-foreground italic leading-relaxed sm:leading-loose font-sans">
        "{testimonial.content}"
      </p>
    </div>
  );

  // Render testimonial lists untuk row 1
  const row1TestimonialLists = useMemo(
    () =>
      Array.from({ length: row1CopyCount }, (_, copyIndex) => (
        <div
          className="flex items-center"
          key={`row1-copy-${copyIndex}`}
          aria-hidden={copyIndex > 0}
          ref={copyIndex === 0 ? row1SeqRef : undefined}
        >
          {firstRow.map((testimonial, itemIndex) => (
            <TestimonialCard
              key={`row1-${copyIndex}-${itemIndex}`}
              testimonial={testimonial}
              index={itemIndex}
            />
          ))}
        </div>
      )),
    [row1CopyCount, firstRow, cardWidth]
  );

  // Render testimonial lists untuk row 2
  const row2TestimonialLists = useMemo(
    () =>
      Array.from({ length: row2CopyCount }, (_, copyIndex) => (
        <div
          className="flex items-center"
          key={`row2-copy-${copyIndex}`}
          aria-hidden={copyIndex > 0}
          ref={copyIndex === 0 ? row2SeqRef : undefined}
        >
          {secondRow.map((testimonial, itemIndex) => (
            <TestimonialCard
              key={`row2-${copyIndex}-${itemIndex}`}
              testimonial={testimonial}
              index={itemIndex}
            />
          ))}
        </div>
      )),
    [row2CopyCount, secondRow, cardWidth]
  );

  return (
    <section className="py-8 sm:py-12 md:py-16 bg-background overflow-hidden">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8">
        {/* Header */}
        <div className="grid grid-cols-1 md:grid-cols-2 items-center mb-8 sm:mb-12 md:mb-16 gap-8">
          {/* Kolom Teks */}
          <div>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground mb-3 sm:mb-4">
              Apa Kata Mereka Tentang
            </h2>
            <p className="text-base sm:text-lg md:text-xl text-muted-foreground max-w-2xl">
              Platform ini telah membantu berbagai organisasi dalam
              menyelenggarakan event secara profesional.
            </p>
          </div>

          {/* Kolom Gambar */}
          <div>
            <img
              src="/images/logo.png"
              alt="Testimonial"
              className="w-full h-full object-cover rounded-lg"
            />
          </div>
        </div>

        {/* Row 1 - Slider ke kiri */}
        <div className="relative mb-6 sm:mb-3 md:mb-5">
          <div
            ref={row1ContainerRef}
            className="relative overflow-hidden py-3 sm:py-4 rounded-lg group"
            onMouseEnter={handleRow1MouseEnter}
            onMouseLeave={handleRow1MouseLeave}
          >
            <div
              className="flex w-max will-change-transform select-none motion-reduce:transform-none"
              ref={row1TrackRef}
            >
              {row1TestimonialLists}
            </div>

            {/* Gradient overlay */}
            <div className="absolute left-0 top-0 w-12 sm:w-16 md:w-20 h-full bg-gradient-to-r from-background to-transparent z-10"></div>
            <div className="absolute right-0 top-0 w-12 sm:w-16 md:w-20 h-full bg-gradient-to-l from-background to-transparent z-10"></div>
          </div>
        </div>

        {/* Row 2 - Slider ke kanan */}
        <div className="relative">
          <div
            ref={row2ContainerRef}
            className="relative overflow-hidden py-3 sm:py-4 rounded-lg group"
            onMouseEnter={handleRow2MouseEnter}
            onMouseLeave={handleRow2MouseLeave}
          >
            <div
              className="flex w-max will-change-transform select-none motion-reduce:transform-none"
              ref={row2TrackRef}
            >
              {row2TestimonialLists}
            </div>

            {/* Gradient overlay */}
            <div className="absolute left-0 top-0 w-12 sm:w-16 md:w-20 h-full bg-gradient-to-r from-background to-transparent z-10"></div>
            <div className="absolute right-0 top-0 w-12 sm:w-16 md:w-20 h-full bg-gradient-to-l from-background to-transparent z-10"></div>
          </div>
        </div>
      </div>
    </section>
  );
}
