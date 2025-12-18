export type NavLink = {
  href: string;
  label: string;
  hasDropdown?: boolean;
};

export const navLinks: NavLink[] = [
  // { href: "/", label: "Home" },
  { href: "/vendors", label: "Vendors" },
  { href: "/riders", label: "Riders" },
  { href: "/about", label: "About us" },
];
