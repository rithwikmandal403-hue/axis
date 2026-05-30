"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import Image from "next/image";

import { SignInButton } from "@/components/ui/sign-in-button";

export function Navbar() {
  return (
    <motion.header
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="relative mx-auto flex w-full max-w-[1360px] items-center justify-center px-6 py-6 md:px-10"
    >
      <div className="absolute right-6 top-1/2 -translate-y-1/2 md:right-10">
        <SignInButton />
      </div>

      <Link href="/" className="transition-opacity hover:opacity-80">
        <Image
          src="/axis-logo.png"
          alt="Axis logo"
          width={160}
          height={200}
          priority
          className="h-[72px] w-auto object-contain md:h-[80px]"
        />
      </Link>
    </motion.header>
  );
}
