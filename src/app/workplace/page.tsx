import type { Metadata } from "next";

import { EnvironmentPage } from "@/components/environment/environment-page";
import { workplaceContent } from "@/lib/environment-content";

export const metadata: Metadata = {
  title: workplaceContent.metadata.title,
  description: workplaceContent.metadata.description,
};

export default function WorkplacePage() {
  return <EnvironmentPage content={workplaceContent} />;
}
