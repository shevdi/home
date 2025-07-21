import type { Route } from "./+types/projects";
import ProjectsPage from "../pages/projects/projects";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Projects page" },
    { name: "description", content: "shevdi projects" },
  ];
}

export default function Projects() {
  return <ProjectsPage />;
}
