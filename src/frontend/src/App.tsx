import { Toaster } from "@/components/ui/sonner";
import {
  Outlet,
  RouterProvider,
  createRootRoute,
  createRoute,
  createRouter,
} from "@tanstack/react-router";
import Footer from "./components/layout/Footer";
import Navbar from "./components/layout/Navbar";
import WhatsAppButton from "./components/layout/WhatsAppButton";
import AboutPage from "./pages/AboutPage";
import BlogPage from "./pages/BlogPage";
import BlogPostPage from "./pages/BlogPostPage";
import ContactPage from "./pages/ContactPage";
import CountriesPage from "./pages/CountriesPage";
import HomePage from "./pages/HomePage";
import LanguageProficiencyPage from "./pages/LanguageProficiencyPage";
import OnlineDegreePage from "./pages/OnlineDegreePage";
import OnlineProfessionalCoursesPage from "./pages/OnlineProfessionalCoursesPage";
import ProfessionalInternshipsPage from "./pages/ProfessionalInternshipsPage";
import ServicesPage from "./pages/ServicesPage";

// Root layout
const rootRoute = createRootRoute({
  component: () => (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <div className="flex-1">
        <Outlet />
      </div>
      <Footer />
      <WhatsAppButton />
      <Toaster />
    </div>
  ),
});

// Routes
const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  component: HomePage,
});

const aboutRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/about",
  component: AboutPage,
});

const servicesRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/services",
  component: ServicesPage,
});

const countriesRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/countries",
  component: CountriesPage,
});

const blogRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/blog",
  component: BlogPage,
});

const blogPostRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/blog/$id",
  component: BlogPostPage,
});

const contactRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/contact",
  component: ContactPage,
});

const onlineDegreeRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/services/online-degree-courses",
  component: OnlineDegreePage,
});

const onlineProfessionalRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/services/online-professional-courses",
  component: OnlineProfessionalCoursesPage,
});

const professionalInternshipsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/services/professional-internships",
  component: ProfessionalInternshipsPage,
});

const languageProficiencyRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/services/language-proficiency",
  component: LanguageProficiencyPage,
});

const routeTree = rootRoute.addChildren([
  indexRoute,
  aboutRoute,
  servicesRoute,
  countriesRoute,
  blogRoute,
  blogPostRoute,
  contactRoute,
  onlineDegreeRoute,
  onlineProfessionalRoute,
  professionalInternshipsRoute,
  languageProficiencyRoute,
]);

const router = createRouter({ routeTree });

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

export default function App() {
  return <RouterProvider router={router} />;
}
