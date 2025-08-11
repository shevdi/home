import { useEffect, useState } from "react";

export function Welcome() {
  const [title, setTitle] = useState("");

  useEffect(() => {
    fetch(`${process.env.BACKEND_URL}/title`)
      .then((resp) => resp.json())
      .then((resp) => {
        setTitle(resp.title);
      })
      .catch((error) => {
        console.error("Failed to fetch title:", error);
        // setTitle(`Failed to fetch title: ${error}`);
      });
  }, []);

  return (
    <div>
      <h1>{title}</h1>
    </div>
  );
}
