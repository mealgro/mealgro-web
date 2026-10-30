export type NavChild = {
  href: string;
  label: string;
};

export type NavLink = {
  href: string;
  label: string;
  /** Shown as a dropdown: on hover on desktop, as an expandable group in the mobile menus. */
  children?: NavChild[];
};

export const navLinks: NavLink[] = [
  // { href: "/", label: "Home" },
  {
    href: "/vendors",
    label: "Vendors",
    children: [
      { href: "/vendors", label: "Become a vendor" },
      // The portal sends a signed-out visitor to /account/login itself.
      { href: "/account", label: "Vendor portal" },
      { href: "/affiliate", label: "Affiliate program" },
    ],
  },
  { href: "/riders", label: "Riders" },
  { href: "/about", label: "About us" },
];
