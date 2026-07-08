with open('markdown/PROJECT_STRUCTURE.md', 'r') as f:
    content = f.read()

# Update terms
content = content.replace('| `app/terms/`                 | Terms & conditions static page.', '| `app/(main)/terms/`          | Terms & conditions static page. `(main)` route group added.')

# Update borrow
content = content.replace('item detail, booking form, deposit tracker, review submission, and wishlist.', 'item detail, booking form, review list, and wishlist.')

# Update disputes / moderation
content = content.replace('| `app/(dashboard)/disputes/`  | Role-aware disputes page: `AdminDisputes.tsx` and `StudentDisputes.tsx` co-located. Sub-routes for raising and viewing personal disputes.', '| `app/(dashboard)/moderation/`| Centralized moderation/investigation page (admin-only). Replaces disputes and penalties.')

# Remove history
content = content.replace('| `app/(dashboard)/history/`   | Rental history page for students.                                                                                                                                            |\n', '')

# Update my-posts
content = content.replace('add/edit, active rentals, incoming requests, earnings, condition reports, and penalty views.', 'add/edit, active rentals, and incoming requests.')

# Remove penalties
content = content.replace('| `app/(dashboard)/penalties/` | Penalty management page (admin).                                                                                                                                             |\n', '')

# Update profile
content = content.replace('Sub-routes for editing and viewing own reviews.', 'Sub-routes for editing, viewing own reviews, and viewing own reports. Added `[userId]` for public profile views.')

# Update ui
content = content.replace('| `components/ui/`             | Primitive UI component library (reserved/empty — for future headless components).', '| `components/ui/`             | Primitive UI component library (Button, Card, Modal, SearchableCombobox, Toast, etc.).')
content = content.replace('| `components/misc/`           | Small supporting UI components such as modals and notification bell.                                                                                                         |\n', '| `components/misc/`           | Small supporting UI components such as modals and notification bell.                                                                                                         |\n| `components/review/`         | Review-specific UI components (ReviewCard, RatingBreakdown, ReviewSummary, etc.).                                                                                            |\n')


with open('markdown/PROJECT_STRUCTURE.md', 'w') as f:
    f.write(content)
