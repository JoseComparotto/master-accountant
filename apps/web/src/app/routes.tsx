import { createAppRouter, AppNavigate } from "./lib/navigation";
import { Layout } from "./pages/Layout";
import { InteractivePage } from "./pages/InteractivePage";
import { SpreadsheetPage } from "./pages/SpreadsheetPage";

export const router = createAppRouter([
  {
    path: "/",
    Component: Layout,
    children: [
      { index: true, element: <AppNavigate to="/interactive" replace /> },
      { path: "interactive", Component: InteractivePage },
      { path: "interactive/:accountId", Component: InteractivePage },
      { path: "spreadsheet", Component: SpreadsheetPage },
      { path: "*", element: <AppNavigate to="/interactive" replace /> },
    ],
  },
]);
