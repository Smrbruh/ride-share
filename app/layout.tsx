import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/contexts/auth-context";
import { ToastProvider } from "@/contexts/toast-context";
import { ThemeProvider } from "@/contexts/theme-context";
import { Toaster } from "@/components/ui/toaster";
export const metadata: Metadata = {
  title: "Ride Booking",
  description: "Ride booking platform"
};
const THEME_SCRIPT = `(function(){try{var stored=localStorage.getItem("ride_app_theme");var mode=stored||"system";var resolved=mode==="system"?(window.matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light"):mode;if(resolved==="dark")document.documentElement.classList.add("dark");}catch(error){}})();`;
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_SCRIPT }} />
      </head>
      <body className="bg-background text-foreground antialiased">
        <a href="#main-content" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[200] focus:rounded-xl focus:bg-accent focus:px-4 focus:py-2 focus:text-accent-foreground">
          Skip to main content
        </a>
        <ThemeProvider>
          <ToastProvider>
            <AuthProvider>{children}</AuthProvider>
            <Toaster />
          </ToastProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
