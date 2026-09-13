export const siteConfig = {
  name: "TokMieja Shop",
  brand: "TokMieja",
  tagline: "Good Food, Made for Every Day.",
  intro: "Explore something delicious from TokMieja.",
  description:
    "A small shop for TokMieja sambal and everyday food.",
} as const;

export const navItems = [
  { label: "Home", href: "/" },
  { label: "Shop", href: "/products" },
  { label: "About", href: "/#about" },
] as const;
