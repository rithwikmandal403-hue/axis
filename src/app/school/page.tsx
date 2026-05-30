import type { Metadata } from "next";

import { SchoolEnvironmentPage } from "@/components/school/school-environment-page";
import { schoolContent } from "@/lib/environment-content";

export const metadata: Metadata = {
  title: schoolContent.metadata.title,
  description: schoolContent.metadata.description,
};

export default function SchoolPage() {
  return <SchoolEnvironmentPage content={schoolContent} />;
}
