import type { Route } from "./+types/projects";
import { useEffect, useState } from "react";
import type { Project } from "../types/project";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Home page" },
    { name: "description", content: "shevdi projects" },
  ];
}

export default function Projects() {
  const [projects, setProjects]: [Project[], any] = useState([]);

  useEffect(() => {
    fetch(`${import.meta.env.VITE_BACKEND_URL}/projects`)
      .then((resp) => resp.json())
      .then((resp) => {
        setProjects(resp);
      })
      .catch((error) => {
        console.error("Failed to fetch projects:", error);
      });
  }, []);
  return (
    <div>
      <h1>Список проектов</h1>
      {projects.map((item) => (
        <div>
          <a target="_blank" href={item.url}>
            {item.title}
          </a>
        </div>
      ))}
    </div>
  );
}
