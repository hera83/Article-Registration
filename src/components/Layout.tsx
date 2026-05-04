import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { Boxes, ListChecks, Search, Settings as SettingsIcon } from "lucide-react";
import { ThemeToggle } from "./ThemeToggle";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

const NAV = [
  { to: "/", label: "Søg", icon: Search, end: true },
  { to: "/shopping", label: "Indkøb", icon: ListChecks },
];

const SETTINGS = { to: "/settings", label: "Indstillinger", icon: SettingsIcon };

export function Layout() {
  const navigate = useNavigate();

  return (
    <div className="min-h-full flex flex-col">
      <header className="sticky top-0 z-30 border-b bg-background/85 backdrop-blur supports-[backdrop-filter]:bg-background/70">
        <div className="container flex h-14 items-center gap-4">
          <button
            onClick={() => navigate("/")}
            className="flex items-center gap-2 font-semibold tracking-tight"
            aria-label="Artikelregistrering – forside"
          >
            <Boxes className="h-5 w-5 text-primary" />
            <span>Artikelregistrering</span>
          </button>

          <nav className="ml-6 hidden md:flex items-center gap-1">
            {NAV.map(({ to, label, icon: Icon, end }) => (
              <NavLink
                key={to}
                to={to}
                end={end}
                className={({ isActive }) =>
                  cn(
                    "inline-flex items-center gap-2 rounded-md px-3 py-1.5 text-sm transition-colors",
                    isActive
                      ? "bg-secondary text-foreground"
                      : "text-muted-foreground hover:text-foreground hover:bg-secondary/60"
                  )
                }
              >
                <Icon className="h-4 w-4" />
                {label}
              </NavLink>
            ))}
          </nav>

          <div className="ml-auto flex items-center gap-1">
            <Tooltip>
              <TooltipTrigger asChild>
                <NavLink
                  to={SETTINGS.to}
                  aria-label={SETTINGS.label}
                  className={({ isActive }) =>
                    cn(
                      "inline-flex h-10 w-10 items-center justify-center rounded-md transition-colors",
                      isActive
                        ? "bg-secondary text-foreground"
                        : "text-muted-foreground hover:text-foreground hover:bg-secondary/60"
                    )
                  }
                >
                  <SETTINGS.icon className="h-4 w-4" />
                </NavLink>
              </TooltipTrigger>
              <TooltipContent>{SETTINGS.label}</TooltipContent>
            </Tooltip>
            <ThemeToggle />
          </div>
        </div>
      </header>

      <main className="flex-1 pb-24 md:pb-10">
        <Outlet />
      </main>

      {/* Mobil bundnavigation */}
      <nav className="md:hidden fixed bottom-0 inset-x-0 z-30 border-t bg-background/95 backdrop-blur">
        <div className="grid grid-cols-3">
          {[...NAV, { ...SETTINGS, end: false }].map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                cn(
                  "flex flex-col items-center gap-0.5 py-2.5 text-xs",
                  isActive ? "text-primary" : "text-muted-foreground"
                )
              }
            >
              <Icon className="h-5 w-5" />
              {label}
            </NavLink>
          ))}
        </div>
      </nav>
    </div>
  );
}
