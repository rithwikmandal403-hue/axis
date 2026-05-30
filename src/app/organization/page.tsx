import type { Metadata } from "next";

import { EnvironmentPage } from "@/components/environment/environment-page";
import { organizationContent } from "@/lib/environment-content";

export const metadata: Metadata = {
  title: organizationContent.metadata.title,
  description: organizationContent.metadata.description,
};

export default function OrganizationPage() {
  return <EnvironmentPage content={organizationContent} />;
}
