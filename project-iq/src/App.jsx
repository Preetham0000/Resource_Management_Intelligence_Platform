import { useState } from "react";
import "./index.css";

import LoginPage    from "./pages/LoginPage";
import DashboardPage from "./pages/DashboardPage";
import ProjectsPage  from "./pages/ProjectsPage";
import SprintsPage   from "./pages/SprintsPage";
import TasksPage     from "./pages/TasksPage";
import ResourcesPage from "./pages/ResourcesPage";
import AnalyticsPage from "./pages/AnalyticsPage";
import RiskPage      from "./pages/RiskPage";
import { isLoggedIn, getRole } from "./utils/auth";
export default function App() {
  const [loggedIn, setLoggedIn] = useState(isLoggedIn());
  const [page, setPage] = useState("dashboard");

  if (!loggedIn) {
    return <LoginPage onLogin={() => setLoggedIn(true)} />;
  }

  const nav = (p) => setPage(p);

  switch (page) {
    case "dashboard": return <DashboardPage onNav={nav} />;
    case "projects":  return <ProjectsPage  onNav={nav} />;
    case "sprints":   return <SprintsPage   onNav={nav} />;
    case "tasks":     return <TasksPage     onNav={nav} />;
    case "resources": return <ResourcesPage onNav={nav} />;
    case "analytics": return <AnalyticsPage onNav={nav} />;
    case "risk":      return <RiskPage      onNav={nav} />;
    default:          return <DashboardPage onNav={nav} />;
  }
}
