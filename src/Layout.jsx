import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";

const Layout = () => {
  return (
    <div>
      <Outlet />
    </div>
  );
};

export default Layout;
