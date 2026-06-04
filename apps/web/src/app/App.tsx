import { AppRouterProvider } from "./lib/navigation";
import { router } from "./routes";

export default function App() {
  return <AppRouterProvider router={router} />;
}
