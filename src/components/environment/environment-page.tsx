"use client";

import { ContextualCards } from "@/components/environment/contextual-cards";
import { EcosystemCapabilities } from "@/components/environment/ecosystem-capabilities";
import { EnvironmentHero } from "@/components/environment/environment-hero";
import { EnvironmentIntro } from "@/components/environment/environment-intro";
import { OperationalInsights } from "@/components/environment/operational-insights";
import { WorkflowPreviews } from "@/components/environment/workflow-previews";
import { PageNavbar } from "@/components/layout/page-navbar";
import { PrimaryButton } from "@/components/ui/button";
import type { EnvironmentContent } from "@/lib/environment-content";

type EnvironmentPageProps = {
  content: EnvironmentContent;
  footerCta?: {
    label: string;
    onClick: () => void;
  };
};

export function EnvironmentPage({ content, footerCta }: EnvironmentPageProps) {
  return (
    <div className="min-h-screen bg-axis-bg text-axis-text">
      <PageNavbar />
      <EnvironmentHero content={content.hero} />
      <EnvironmentIntro content={content.intro} />
      {content.insights && <OperationalInsights content={content.insights} />}
      {content.capabilities && <EcosystemCapabilities content={content.capabilities} />}
      <WorkflowPreviews content={content.workflows} />
      <ContextualCards content={content.contextual} />

      <section className="border-t border-axis-line">
        <div className="mx-auto flex max-w-[1360px] flex-col items-start justify-between gap-6 px-6 py-16 md:flex-row md:items-center md:px-10 md:py-20">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-axis-muted">
              Continue exploring
            </p>
            <p className="mt-3 text-2xl font-medium tracking-tight text-axis-text">
              Shape your {content.label.toLowerCase()} ecosystem with Axis.
            </p>
          </div>
          <PrimaryButton
            className="px-7 py-3.5 text-base"
            onClick={footerCta?.onClick}
          >
            {footerCta?.label ?? "Begin setup"}
          </PrimaryButton>
        </div>
      </section>
    </div>
  );
}
