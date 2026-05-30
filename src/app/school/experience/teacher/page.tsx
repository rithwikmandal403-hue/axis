import { redirect } from "next/navigation";

export default function TeacherDemoRedirectPage() {
  redirect("/school/experience/demo?role=teacher");
}
