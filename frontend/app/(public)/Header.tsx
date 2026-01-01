/* eslint-disable @next/next/no-html-link-for-pages */
"use client";

import {
  Navbar,
  NavBody,
  NavItems,
  MobileNav,
  NavbarLogo,
  NavbarButton,
  MobileNavHeader,
  MobileNavToggle,
  MobileNavMenu,
} from "@/components/ui/resizable-navbar";
import { useState, useEffect } from "react";
import { useTheme } from "next-themes";
import { Sun, Moon } from "lucide-react";

interface NavItem {
  name: string;
  link: string;
  subItems?: NavItem[];
}

export default function Header() {
  const [scrolled, setScrolled] = useState(false);
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navItems: NavItem[] = [
    { name: "Home", link: "/" },
    {
      name: "Services",
      link: "#services",
    },
    {
      name: "Community",
      link: "#community",
    },
    { name: "Articles", link: "/articles" },
    { name: "Contact", link: "/contact" },
  ];

  const renderNavItems = (isMobile = false) =>
    navItems.map((item, idx) => {
      if (item.subItems && !isMobile) {
        return (
          <div key={idx} className="relative group">
            <button
              className={`px-3 py-2 transition-colors ${
                scrolled
                  ? "text-foreground hover:text-secondary-light"
                  : "text-foreground hover:text-secondary"
              }`}
            >
              {item.name}
              <svg
                className="w-4 h-4 ml-1 inline-block"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </button>
            <div className="absolute left-0 mt-2 w-56 rounded-md shadow-lg bg-background dark:bg-foreground/90 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
              <div className="py-1">
                {item.subItems.map((subItem, subIdx) => (
                  <a
                    key={subIdx}
                    href={subItem.link}
                    className="block px-4 py-2 text-sm text-foreground dark:text-background rounded-md hover:bg-primary/5 hover:text-secondary-light"
                  >
                    {subItem.name}
                  </a>
                ))}
              </div>
            </div>
          </div>
        );
      }

      return (
        <a
          key={idx}
          href={item.link}
          className={`px-3 py-2 transition-colors ${
            scrolled
              ? "text-foreground hover:text-secondary-light"
              : "text-foreground hover:text-secondary"
          }`}
          onClick={() => isMobile && setIsMobileMenuOpen(false)}
        >
          {item.name}
        </a>
      );
    });

  const renderMobileSubItems = (item: NavItem) => {
    if (!item.subItems) return null;
    return (
      <div className="pl-4 border-l border-foreground/20 dark:border-background/20">
        {item.subItems.map((subItem, subIdx) => (
          <a
            key={subIdx}
            href={subItem.link}
            onClick={() => setIsMobileMenuOpen(false)}
            className={`block py-2 transition-colors ${
              scrolled
                ? "text-foreground/80 hover:text-secondary-light dark:text-foreground/80 dark:hover:text-secondary"
                : "text-background/80 hover:text-secondary-light dark:text-background/80 dark:hover:text-secondary"
            }`}
          >
            {subItem.name}
          </a>
        ))}
      </div>
    );
  };

  return (
    <div
      className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 ${scrolled ? "" : "bg-transparent"}`}
    >
      <Navbar>
        <NavBody>
          <div className="font-bold text-xl">
            <a
              href="/"
              className={`transition-colors ${scrolled ? "text-foreground" : "text-foreground"}`}
            >
              DocGo
            </a>
          </div>

          <div className="hidden md:flex items-center gap-1">
            {renderNavItems()}
          </div>

          <div className="hidden md:flex items-center gap-4">
            <button
              aria-label="Toggle theme"
              onClick={() => setTheme(theme === "light" ? "dark" : "light")}
              className={`p-2 rounded-md border transition-all duration-200 hover:scale-105 ${
                scrolled
                  ? "text-foreground border-foreground/40 hover:bg-foreground/10"
                  : "text-foreground border-foreground/40 hover:bg-foreground/10"
              }`}
            >
              {mounted &&
                (theme === "light" ? (
                  <Moon size={18} strokeWidth={1.8} />
                ) : (
                  <Sun size={18} strokeWidth={1.8} />
                ))}
            </button>
          </div>
        </NavBody>

        <MobileNav>
          <MobileNavHeader>
            <div className="font-bold text-xl">
              <a
                href="/"
                className={`transition-colors ${scrolled ? "text-foreground dark:text-background" : "text-foreground dark:text-background"}`}
              >
                DocGo
              </a>
            </div>
            <MobileNavToggle
              isOpen={isMobileMenuOpen}
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className={
                scrolled
                  ? "text-foreground dark:text-background"
                  : "text-foreground dark:text-background"
              }
            />
          </MobileNavHeader>

          <MobileNavMenu
            isOpen={isMobileMenuOpen}
            onClose={() => setIsMobileMenuOpen(false)}
            className={
              scrolled
                ? "bg-background dark:bg-foreground"
                : "bg-background/95 dark:bg-foreground/95 backdrop-blur-md"
            }
          >
            {navItems.map((item, idx) => (
              <div key={`mobile-link-${idx}`} className="w-full">
                <div className="flex flex-col">
                  <a
                    href={item.link}
                    onClick={() => !item.subItems && setIsMobileMenuOpen(false)}
                    className={`py-3 text-left transition-colors ${
                      scrolled
                        ? "text-foreground dark:text-background hover:text-secondary-light dark:hover:text-secondary"
                        : "text-foreground dark:text-background hover:text-secondary-light dark:hover:text-secondary"
                    }`}
                  >
                    <span className="block">{item.name}</span>
                    {item.subItems && (
                      <svg
                        className="w-4 h-4 float-right mt-1"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        style={{
                          color: scrolled
                            ? theme === "dark"
                              ? "white"
                              : "inherit"
                            : theme === "dark"
                              ? "white"
                              : "inherit",
                        }}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 9l-7 7-7-7"
                        />
                      </svg>
                    )}
                  </a>
                  {renderMobileSubItems(item)}
                </div>
              </div>
            ))}

            <div className="mt-4 pt-4 border-t border-foreground/20 dark:border-background/20">
              <button
                onClick={() => {
                  setTheme(theme === "light" ? "dark" : "light");
                  setIsMobileMenuOpen(false);
                }}
                className={`w-full px-4 py-3 rounded-lg border transition-colors text-left ${
                  scrolled
                    ? "border-foreground/50 text-foreground hover:bg-foreground/10 dark:border-background/50 dark:text-background dark:hover:bg-background/20"
                    : "border-foreground/50 text-foreground hover:bg-foreground/10 dark:border-background/50 dark:text-background dark:hover:bg-background/20"
                }`}
              >
                {mounted
                  ? theme === "light"
                    ? "🌙 Switch to Dark Mode"
                    : "☀️ Switch to Light Mode"
                  : "☀️ Loading..."}
              </button>
            </div>
          </MobileNavMenu>
        </MobileNav>
      </Navbar>
    </div>
  );
}
