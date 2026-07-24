// Disabled on purpose: the stock component registers the docs sidebar as the
// drawer's "secondary menu", which creates a nested panel with a
// "Back to main menu" button. Our swizzled Navbar/MobileSidebar/PrimaryMenu
// renders the full docs tree as the one and only mobile menu instead.
export default function DocSidebarMobile(): null {
  return null;
}
