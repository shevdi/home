import type { Route } from "./+types/home";
import { Welcome } from "../welcome/welcome";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Home page" },
    { name: "description", content: "shevdi home page" },
  ];
}

export default function Home() {
  return <Welcome />;
}
