import type { Metadata } from "next";

import { ExperienceEntrance } from "@/components/school/experience-entrance";
import { RoleSelection } from "@/components/school/role-selection";

export const metadata: Metadata = {
  title: "Experience Axis — School Demo",
  description: "Explore how Axis adapts across operational roles in a connected school environment.",
};

export default function SchoolExperiencePage() {
  return (
    <ExperienceEntrance>
      <RoleSelection />
    </ExperienceEntrance>
  );
}
