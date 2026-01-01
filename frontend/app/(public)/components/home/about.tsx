"use client";
import { cn } from "@/lib/utils";
import React, { useEffect, useState } from "react";

import { BentoGrid, BentoGridItem } from "@/components/ui/bento-grid";
import {
  IconHeartbeat,
  IconPill,
  IconCalendarEvent,
  IconBellRinging,
  IconTruckDelivery,
  IconStethoscope,
  IconClipboardHeart,
  IconChefHat,
  IconChartLine,
  IconShieldCheck,
} from "@tabler/icons-react";
import { motion } from "motion/react";
import { LayoutTextFlip } from "@/components/ui/layout-text-flip";

export function About() {
  return (
    <div className="py-20 bg-background">
      <div className="max-w-7xl mx-auto px-2 sm:px-6 lg:px-4">
        <div className="pb-10">
          <motion.div className="relative mx-4 my-4 flex flex-col items-center justify-center gap-4 text-center sm:mx-0 sm:mb-0 sm:flex-row">
            <LayoutTextFlip
              text="Track your health with "
              words={[
                "DocGo",
                "DocGo App",
                "Your Personal Health Tracker",
                "Smart Health Assistant",
              ]}
            />
          </motion.div>
          <p className="mt-4 text-center text-base text-neutral-600 dark:text-neutral-400">
            Monitor your wellness daily with DocGo <br /> get personalized
            health updates, track diagnoses, receive medication and meal
            reminders, discover tailored recipes, and enjoy timely delivery of
            medicines and healthy meals.
          </p>
        </div>

        <BentoGrid className="max-w-6xl mx-auto px-10 md:px-0 auto-rows-[20rem] md:auto-rows-[20rem]">
          {items.map((item, i) => (
            <BentoGridItem
              key={i}
              title={item.title}
              description={item.description}
              header={item.header}
              className={cn("[&>p:text-lg]", item.className)}
              icon={item.icon}
            />
          ))}
        </BentoGrid>
      </div>
    </div>
  );
}

const SkeletonOne = () => {
  const variants = {
    initial: {
      x: 0,
    },
    animate: {
      x: 10,
      rotate: 5,
      transition: {
        duration: 0.2,
      },
    },
  };
  const variantsSecond = {
    initial: {
      x: 0,
    },
    animate: {
      x: -10,
      rotate: -5,
      transition: {
        duration: 0.2,
      },
    },
  };

  return (
    <motion.div
      initial="initial"
      whileHover="animate"
      className="flex flex-1 w-full h-full min-h-[6rem] dark:bg-dot-white/[0.2] bg-dot-black/[0.2] flex-col space-y-2"
    >
      <motion.div
        variants={variants}
        className="flex flex-row rounded-full border border-neutral-200 dark:border-white/[0.2] p-2 items-center space-x-2 bg-white dark:bg-neutral-900"
      >
        <div className="h-6 w-6 rounded-full bg-gradient-to-r from-primary to-primary-dark shrink-0" />
        <div className="w-full bg-gray-100 dark:bg-neutral-800 h-4 rounded-full" />
      </motion.div>
      <motion.div
        variants={variantsSecond}
        className="flex flex-row rounded-full border border-neutral-200 dark:border-white/[0.2] p-2 items-center space-x-2 w-3/4 ml-auto bg-white dark:bg-neutral-900"
      >
        <div className="w-full bg-gray-100 dark:bg-neutral-800 h-4 rounded-full" />
        <div className="h-6 w-6 rounded-full bg-gradient-to-r from-primary to-primary-dark shrink-0" />
      </motion.div>
      <motion.div
        variants={variants}
        className="flex flex-row rounded-full border border-neutral-200 dark:border-white/[0.2] p-2 items-center space-x-2 bg-white dark:bg-neutral-900"
      >
        <div className="h-6 w-6 rounded-full bg-gradient-to-r from-primary to-primary-dark shrink-0" />
        <div className="w-full bg-gray-100 dark:bg-neutral-800 h-4 rounded-full" />
      </motion.div>
    </motion.div>
  );
};

const SkeletonTwo = () => {
  const variants = {
    initial: { width: 0 },
    animate: {
      width: "100%",
      transition: { duration: 0.2 },
    },
    hover: {
      width: ["0%", "100%"],
      transition: { duration: 2 },
    },
  };

  const arr = new Array(6).fill(0);

  // ✅ simpan random width di state
  const [widths, setWidths] = useState<number[]>([]);

  // ✅ hitung random SETELAH hydration
  useEffect(() => {
    setWidths(arr.map(() => Math.random() * (100 - 40) + 40));
  }, []);

  return (
    <motion.div
      initial="initial"
      animate="animate"
      whileHover="hover"
      className="flex flex-1 w-full h-full min-h-[6rem] dark:bg-dot-white/[0.2] bg-dot-black/[0.2] flex-col space-y-2"
    >
      {arr.map((_, i) => (
        <motion.div
          key={"skeleton-two" + i}
          variants={variants}
          style={{
            maxWidth: widths[i] ? `${widths[i]}%` : "100%",
          }}
          className="flex flex-row rounded-full border border-neutral-200 dark:border-white/[0.2] p-2 items-center space-x-2 bg-neutral-100 dark:bg-neutral-900 w-full h-4"
        />
      ))}
    </motion.div>
  );
};

const SkeletonThree = () => {
  const variants = {
    initial: {
      backgroundPosition: "0 50%",
    },
    animate: {
      backgroundPosition: ["0, 50%", "100% 50%", "0 50%"],
    },
  };
  return (
    <motion.div
      initial="initial"
      animate="animate"
      variants={variants}
      transition={{
        duration: 5,
        repeat: Infinity,
        repeatType: "reverse",
      }}
      className="flex flex-1 w-full h-full min-h-[6rem] dark:bg-dot-white/[0.2] rounded-lg bg-dot-black/[0.2] flex-col space-y-2"
      style={{
        background:
          "linear-gradient(-45deg, var(--color-primary), var(--color-primary-light), var(--color-accent), var(--color-secondary))",
        backgroundSize: "400% 400%",
      }}
    >
      <motion.div className="h-full w-full rounded-lg"></motion.div>
    </motion.div>
  );
};

const SkeletonFour = () => {
  const first = {
    initial: {
      x: 20,
      rotate: -5,
    },
    hover: {
      x: 0,
      rotate: 0,
    },
  };
  const second = {
    initial: {
      x: -20,
      rotate: 5,
    },
    hover: {
      x: 0,
      rotate: 0,
    },
  };
  return (
    <motion.div
      initial="initial"
      animate="animate"
      whileHover="hover"
      className="flex flex-1 w-full h-full min-h-[6rem] dark:bg-dot-white/[0.2] bg-dot-black/[0.2] flex-row space-x-2"
    >
      <motion.div
        variants={first}
        className="h-full w-1/3 rounded-2xl bg-white p-4 dark:bg-neutral-900 dark:border-white/[0.1] border border-neutral-200 flex flex-col items-center justify-center"
      >
        <div className="rounded-full h-10 w-10 bg-gradient-to-r from-primary to-primary-light flex items-center justify-center">
          <IconHeartbeat className="h-6 w-6 text-white" />
        </div>
        <p className="sm:text-sm text-xs text-center font-semibold text-neutral-600 dark:text-neutral-300 mt-4">
          Pemantauan Kesehatan Real-time
        </p>
        <p className="border border-primary/20 bg-primary/10 dark:bg-primary/20 text-primary dark:text-primary-light text-xs rounded-full px-2 py-0.5 mt-4">
          Aktif
        </p>
      </motion.div>
      <motion.div className="h-full relative z-20 w-1/3 rounded-2xl bg-white p-4 dark:bg-neutral-900 dark:border-white/[0.1] border border-neutral-200 flex flex-col items-center justify-center">
        <div className="rounded-full h-10 w-10 bg-gradient-to-r from-primary to-primary-light flex items-center justify-center">
          <IconChefHat className="h-6 w-6 text-white" />
        </div>
        <p className="sm:text-sm text-xs text-center font-semibold text-neutral-600 dark:text-neutral-300 mt-4">
          Resep Makanan Personal
        </p>
        <p className="border border-green-500/20 bg-green-500/10 dark:bg-green-500/20 text-green-600 dark:text-green-400 text-xs rounded-full px-2 py-0.5 mt-4">
          Sehat
        </p>
      </motion.div>
      <motion.div
        variants={second}
        className="h-full w-1/3 rounded-2xl bg-white p-4 dark:bg-neutral-900 dark:border-white/[0.1] border border-neutral-200 flex flex-col items-center justify-center"
      >
        <div className="rounded-full h-10 w-10 bg-gradient-to-r from-primary to-primary-light flex items-center justify-center">
          <IconPill className="h-6 w-6 text-white" />
        </div>
        <p className="sm:text-sm text-xs text-center font-semibold text-neutral-600 dark:text-neutral-300 mt-4">
          Pengiriman Obat Otomatis
        </p>
        <p className="border border-orange-500/20 bg-orange-500/10 dark:bg-orange-500/20 text-orange-600 dark:text-orange-400 text-xs rounded-full px-2 py-0.5 mt-4">
          Rutin
        </p>
      </motion.div>
    </motion.div>
  );
};

const SkeletonFive = () => {
  const variants = {
    initial: {
      x: 0,
    },
    animate: {
      x: 10,
      rotate: 5,
      transition: {
        duration: 0.2,
      },
    },
  };
  const variantsSecond = {
    initial: {
      x: 0,
    },
    animate: {
      x: -10,
      rotate: -5,
      transition: {
        duration: 0.2,
      },
    },
  };

  return (
    <motion.div
      initial="initial"
      whileHover="animate"
      className="flex flex-1 w-full h-full min-h-[6rem] dark:bg-dot-white/[0.2] bg-dot-black/[0.2] flex-col space-y-2"
    >
      <motion.div
        variants={variants}
        className="flex flex-row rounded-2xl border border-neutral-200 dark:border-white/[0.2] p-2 items-start space-x-2 bg-white dark:bg-neutral-900"
      >
        <div className="h-10 w-10 rounded-full bg-gradient-to-r from-primary to-primary-light flex items-center justify-center shrink-0">
          <IconStethoscope className="h-5 w-5 text-white" />
        </div>
        <p className="text-xs text-neutral-600 dark:text-neutral-300">
          Sistem diagnosa AI yang menganalisis gejala dan memberikan rekomendasi
          awal sebelum konsultasi dokter...
        </p>
      </motion.div>
      <motion.div
        variants={variantsSecond}
        className="flex flex-row rounded-full border border-neutral-200 dark:border-white/[0.2] p-2 items-center justify-end space-x-2 w-3/4 ml-auto bg-white dark:bg-neutral-900"
      >
        <p className="text-xs text-neutral-600 dark:text-neutral-300">
          Update kesehatan harian.
        </p>
        <div className="h-6 w-6 rounded-full bg-gradient-to-r from-primary to-primary-dark shrink-0" />
      </motion.div>
    </motion.div>
  );
};

const SkeletonSix = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="flex flex-1 w-full h-full min-h-[6rem] dark:bg-dot-white/[0.2] bg-dot-black/[0.2] rounded-xl p-4 flex-col items-center justify-center"
    >
      <div className="flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-r from-primary to-primary-light mb-4">
        <IconCalendarEvent className="h-8 w-8 text-white" />
      </div>
      <div className="space-y-2 text-center">
        <div className="h-3 w-32 bg-gradient-to-r from-primary/50 to-primary-light/50 rounded-full mx-auto"></div>
        <div className="h-2 w-24 bg-gradient-to-r from-primary/30 to-primary-light/30 rounded-full mx-auto"></div>
        <div className="h-2 w-28 bg-gradient-to-r from-primary/30 to-primary-light/30 rounded-full mx-auto"></div>
      </div>
    </motion.div>
  );
};

const items = [
  {
    title: "Diagnosa & Pemantauan",
    description: (
      <span className="text-sm text-neutral-600 dark:text-neutral-300">
        Sistem diagnosa AI yang memantau kesehatan Anda 24/7 dengan analisis
        real-time.
      </span>
    ),
    header: <SkeletonOne />,
    className: "md:col-span-1",
    icon: <IconStethoscope className="h-4 w-4 text-primary" />,
  },
  {
    title: "Update Kesehatan Harian",
    description: (
      <span className="text-sm text-neutral-600 dark:text-neutral-300">
        Lacak perkembangan kesehatan dengan laporan harian yang detail dan mudah
        dipahami.
      </span>
    ),
    header: <SkeletonTwo />,
    className: "md:col-span-1",
    icon: <IconChartLine className="h-4 w-4 text-primary" />,
  },
  {
    title: "Pemberitahuan & Jadwal",
    description: (
      <span className="text-sm text-neutral-600 dark:text-neutral-300">
        Notifikasi untuk jadwal minum obat, makan, dan kontrol dokter secara
        tepat waktu.
      </span>
    ),
    header: <SkeletonThree />,
    className: "md:col-span-1",
    icon: <IconBellRinging className="h-4 w-4 text-primary" />,
  },
  {
    title: "Layanan Komprehensif",
    description: (
      <span className="text-sm text-neutral-600 dark:text-neutral-300">
        Paket lengkap: Pemantauan kesehatan, resep makanan, dan pengiriman obat.
      </span>
    ),
    header: <SkeletonFour />,
    className: "md:col-span-2",
    icon: <IconClipboardHeart className="h-4 w-4 text-primary" />,
  },
  {
    title: "Delivery Obat & Makanan",
    description: (
      <span className="text-sm text-neutral-600 dark:text-neutral-300">
        Pengiriman obat dan makanan sehat langsung ke rumah sesuai kebutuhan
        medis.
      </span>
    ),
    header: <SkeletonFive />,
    className: "md:col-span-1",
    icon: <IconTruckDelivery className="h-4 w-4 text-primary" />,
  },
];
