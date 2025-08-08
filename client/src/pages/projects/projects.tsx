import { useEffect, useState } from "react";
import type { Project } from "../../types/project";

export default function ProjectsPage() {
  const [projects, setProjects]: [Project[], any] = useState([]);

  useEffect(() => {
    fetch(`${process.env.BACKEND_URL}/projects`)
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
