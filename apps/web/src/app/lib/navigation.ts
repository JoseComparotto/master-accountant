// Thin navigation wrapper. All app code should import routing primitives from
// here so the migration to next/navigation only touches this file.

export {
  Link as AppLink,
  Outlet as AppOutlet,
  Navigate as AppNavigate,
  RouterProvider as AppRouterProvider,
  createBrowserRouter as createAppRouter,
  useNavigate as useAppNavigate,
  useLocation as useAppLocation,
  useSearchParams as useAppSearchParams,
  useParams as useAppParams,
  useOutletContext as useAppOutletContext,
} from "react-router";

export type { LinkProps as AppLinkProps } from "react-router";
