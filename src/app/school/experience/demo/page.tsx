import type { Metadata } from "next";
import { Suspense } from "react";

import { SharedDemoExperience } from "@/components/school/shared-demo-experience";

export const metadata: Metadata = {
  title: "Axis School Demo",
  description: "Shared demo preview across school roles.",
};

export default function SharedDemoPage() {
  return (
    <Suspense fallback={null}>
      <SharedDemoExperience />
    </Suspense>
  );
}
