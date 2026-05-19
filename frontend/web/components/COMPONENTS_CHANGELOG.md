# Components Changelog

The following files were updated/implemented with boilerplate UI and responsive Tailwind CSS layouts:

- **AdminNavbar.tsx**: Implemented a top navigation bar for the admin portal, featuring a mobile menu toggle, title, and admin user badge.
- **AdminSidebar.tsx**: Implemented a responsive vertical sidebar for admin panels with navigation links (Dashboard, Users, Inventory, Reports) and icons using Lucide-React.
- **AnalyticsChart.tsx**: Built a mockup static bar chart using flexbox and hover effects to display metric trends visually.
- **BookingCard.tsx**: Designed a card to display booking details (title, status pill, dates, and location) for use in borrow/deposit flows.
- **DataTable.tsx**: Created a reusable tabular component with standard headers, and customizable row layouts to structure backend metrics or user states.
- **DateRangePicker.tsx**: Built a basic UI component combining two date-type inputs alongside standard Tailwind borders for scheduling use.
- **ItemCard.tsx**: Implemented a visually appealing product card, with image placeholder state, hover scaling (micro-animations), and price/title.
- **Navbar.tsx**: Completed a sticky global navbar with a search bar input, a gradient title text, a NotifBell component, and user avatar.
- **NotifBell.tsx**: Extracted a notification bell component with an absolutely-positioned badge for unread notification dots.
- **ResolveModal.tsx**: Built a centered overlay modal with framer-motion-style entrance animations, used for user/item moderation confirmation workflows.
- **Sidebar.tsx**: Implemented a generic navigation sidebar specifically designed for student "Discover", "My Borrowing", "History", and "Favorites" routes.
- **StatCard.tsx**: Created a dashboard statistics card highlighting numerical values with trend indicators (upward).
- **TrustBadge.tsx**: Built a micro-component showing a trust score securely packaged in a pill.
- **UserStatusBadge.tsx**: Developed a status pill component using color schemes depending on user state (`active`, `inactive`, `banned`).

All implementations use:

- **React** (Functional Components)
- **Tailwind CSS** (for styling, layouts, and interactive visual aesthetics)
- **Lucide-React** (for standard vector icons)
