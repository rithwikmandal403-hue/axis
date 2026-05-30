"use client";

import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";

import { EnvironmentPage } from "@/components/environment/environment-page";
import { ExperienceTransitionOverlay } from "@/components/school/experience-transition-overlay";
import type { EnvironmentContent } from "@/lib/environment-content";

type SchoolEnvironmentPageProps = {
  content: EnvironmentContent;
};

export function SchoolEnvironmentPage({ content }: SchoolEnvironmentPageProps) {
  const router = useRouter();
  const [isTransitioning, setIsTransitioning] = useState(false);

  const handleExperienceAxis = useCallback(() => {
    setIsTransitioning(true);

    window.setTimeout(() => {
      router.push("/school/experience");
    }, 900);
  }, [router]);

  return (
    <>
      <EnvironmentPage
        content={content}
        footerCta={{ label: "Experience Axis", onClick: handleExperienceAxis }}
      />
      <ExperienceTransitionOverlay active={isTransitioning} />
    </>
  );
}
