import { NavLink, Outlet } from "react-router";

export function Header() {
  return (
    <div>
      <NavLink to="/">Main</NavLink> |&nbsp;
      <NavLink to="/projects">Projects</NavLink> |&nbsp;
      <Outlet />
    </div>
  );
}
