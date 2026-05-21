# ResourceX — Complete Database Schema Breakdown

> A peer-to-peer item rental platform for university students.

---

## Table of Contents

1. [What is ResourceX?](#what-is-resourcex)
2. [Entity Relationship Overview](#entity-relationship-overview)
3. [Table-by-Table Breakdown](#table-by-table-breakdown)
   - [Universities](#1-universities)
   - [Users](#2-users)
   - [StudentVerifications](#3-studentverifications)
   - [Staff](#4-staff)
   - [Items](#5-items)
   - [ItemImages](#6-itemimages)
   - [Bookings](#7-bookings)
   - [Payments](#8-payments)
   - [Reviews](#9-reviews)
   - [Reports](#10-reports)
   - [Disputes](#11-disputes)
   - [Penalties](#12-penalties)
   - [TrustEvents](#13-trustevents)
   - [AuditLogs](#14-auditlogs)
4. [Key Concepts Explained](#key-concepts-explained)
   - [Primary Key vs Foreign Key](#primary-key-vs-foreign-key)
   - [ON DELETE Behaviors](#on-delete-behaviors)
   - [ENUM Fields](#enum-fields)
   - [Timestamps](#timestamps)
5. [What Happens If a Table Is Removed?](#what-happens-if-a-table-is-removed)
6. [Indexes — Why They Exist](#indexes--why-they-exist)
7. [Professor-Style Q&A](#professor-style-qa)

---

## What is ResourceX?

ResourceX is a campus marketplace where **university students can rent items** (laptops, cameras, books, etc.) from each other. The system handles:

- User registration tied to a university
- Item listing and availability
- Booking and payment processing
- Review and rating of users
- Reporting bad actors
- Dispute resolution
- A trust score system for accountability
- Staff moderation with a full audit trail

---

## Entity Relationship Overview

```
Universities ──< Users ──< Items ──< Bookings ──< Payments
                  │   │                  │
                  │   └── StudentVerifications (1-to-1)
                  │                      ├──< Reviews
                  │                      ├──< Disputes ──< Penalties
                  │                      └──< Reports
                  │
                 Staff ──< AuditLogs
                        └──< TrustEvents (via created_by)
```

- `──<` means "one to many"
- A **User** belongs to one **University**
- A **User** owns many **Items**
- An **Item** can have many **Bookings**
- Each **Booking** can have a **Payment**, **Review**, **Dispute**, and **Reports**

---

## Table-by-Table Breakdown

---

### 1. Universities

**Purpose:** Stores all registered universities. Users are linked to a university to verify they are real students.

| Column | Type | Key | Description |
|---|---|---|---|
| `university_id` | INT AUTO_INCREMENT | **PK** | Unique identifier for each university |
| `name` | VARCHAR(150) NOT NULL UNIQUE | — | Full university name, must be unique |
| `domain` | VARCHAR(100) UNIQUE | — | Email domain (e.g., `buet.ac.bd`) for auto-verification |
| `is_verified` | BOOLEAN DEFAULT FALSE | — | Whether this university is officially approved by admin |
| `created_at` | TIMESTAMP DEFAULT NOW | — | When this record was added |

**Why `domain` is useful:** When a student registers with an email like `john@buet.ac.bd`, the system can match the domain to auto-assign the university.

**What if this table did not exist?** Users would have no way to prove they belong to a university. You could not restrict access to verified students only. The platform loses its core identity as a *campus* vault.

---

### 2. Users

**Purpose:** Central table for all student accounts. Nearly every other table links back to Users.

| Column | Type | Key | Description |
|---|---|---|---|
| `user_id` | INT AUTO_INCREMENT | **PK** | Unique ID for every user |
| `student_id` | VARCHAR(50) NOT NULL UNIQUE | — | University-issued student ID (e.g., `2021-2-60-014`) |
| `name` | VARCHAR(100) NOT NULL | — | Full name of the student |
| `email` | VARCHAR(100) NOT NULL UNIQUE | — | Login email, must be unique across all users |
| `password_hash` | VARCHAR(255) NOT NULL | — | Bcrypt-hashed password — **never stored as plain text** |
| `phone` | VARCHAR(20) | — | Optional contact number |
| `university_id` | INT | **FK → Universities** | Which university this student belongs to |
| `trust_score` | INT DEFAULT 100 | — | Reputation score, starts at 100, changes based on behavior |
| `status` | ENUM('ACTIVE','SUSPENDED','BANNED') | — | Account standing; staff can change this |
| `created_at` | TIMESTAMP | — | Account creation time |
| `updated_at` | TIMESTAMP ON UPDATE | — | Auto-updates whenever the row is modified |

**`ON DELETE SET NULL` on university_id:** If a university is removed, the user's `university_id` becomes NULL but the user account itself survives.

**Why `trust_score` starts at 100:** New users start with full trust. Bad behavior (disputes, penalties, poor reviews) reduces this. Good behavior can restore it.

**What if Users did not exist?** The entire platform collapses — there is no concept of an owner, renter, reviewer, or reporter without user accounts.

---

### 3. StudentVerifications

**Purpose:** Tracks the submission and review of each student's ID card image. Ensures only real, verified students can fully use the platform.

| Column | Type | Key | Description |
|---|---|---|---|
| `verification_id` | INT AUTO_INCREMENT | **PK** | Unique ID per verification record |
| `user_id` | INT NOT NULL UNIQUE | **FK → Users** | Which user submitted this — UNIQUE means one record per user |
| `id_card_image` | VARCHAR(255) NOT NULL | — | URL path to the uploaded ID card image |
| `status` | ENUM('PENDING','VERIFIED','REJECTED') | — | Current review status, defaults to PENDING |
| `reviewed_by` | INT DEFAULT NULL | **FK → Staff** | Staff member who reviewed the submission |
| `reviewed_at` | TIMESTAMP NULL | — | When staff completed the review |
| `rejection_reason` | TEXT | — | Filled only if status is REJECTED, explains why |
| `created_at` | TIMESTAMP | — | When the user submitted their ID card |

**Verification lifecycle:**
```
PENDING → VERIFIED
        → REJECTED (with rejection_reason)
```

**Why `user_id` is UNIQUE:** A student only ever has one ID card. UNIQUE on `user_id` enforces one verification record per user at the database level.

**`ON DELETE CASCADE` on user_id:** If the user account is deleted, their verification record is removed too — no orphaned records.

**`ON DELETE SET NULL` on reviewed_by:** If the staff member who reviewed is deleted, the review record is preserved but `reviewed_by` becomes NULL. The decision history is not lost.

**What if StudentVerifications did not exist?** Anyone could create an account and immediately start renting without proof of being a real student. The platform loses its core safety guarantee — that all participants are verified campus members.

---

### 4. Staff

**Purpose:** Stores admin and moderator accounts. Staff **do not rent or list items** — they manage the platform.

| Column | Type | Key | Description |
|---|---|---|---|
| `staff_id` | INT AUTO_INCREMENT | **PK** | Unique ID for each staff member |
| `name` | VARCHAR(100) NOT NULL | — | Staff member's full name |
| `email` | VARCHAR(100) NOT NULL UNIQUE | — | Login email |
| `password_hash` | VARCHAR(255) NOT NULL | — | Hashed password |
| `role` | ENUM('ADMIN','MODERATOR','SUPER_ADMIN') | — | Role determines what actions staff can take |
| `status` | ENUM('ACTIVE','SUSPENDED') | — | Staff can also be suspended |
| `created_at` | TIMESTAMP | — | Account creation time |
| `updated_at` | TIMESTAMP ON UPDATE | — | Last modification time |

**Why separate from Users?** Staff have different roles, permissions, and actions. Mixing them in one table would complicate permission logic and create security risks.

**What if Staff did not exist?** No one can approve bookings, handle disputes, issue penalties, or review reports. The platform becomes unmoderated.

---

### 5. Items

**Purpose:** Represents physical items that users list for rent.

| Column | Type | Key | Description |
|---|---|---|---|
| `item_id` | INT AUTO_INCREMENT | **PK** | Unique ID for each item |
| `owner_id` | INT NOT NULL | **FK → Users** | The student who owns and lists this item |
| `title` | VARCHAR(200) NOT NULL | — | Name/title of the item (e.g., "Sony DSLR Camera") |
| `description` | TEXT | — | Detailed description of the item |
| `category` | VARCHAR(50) | — | Category label (e.g., Electronics, Books, Sports) |
| `item_condition` | VARCHAR(50) | — | Condition of the item (e.g., New, Good, Fair) |
| `daily_rate` | DECIMAL(10,2) NOT NULL | — | Rental price per day in local currency |
| `status` | ENUM('AVAILABLE','UNAVAILABLE','BLOCKED') | — | Whether the item can be booked |
| `created_at` | TIMESTAMP | — | When the listing was created |
| `updated_at` | TIMESTAMP ON UPDATE | — | Last update to the listing |

**`ON DELETE CASCADE` on owner_id:** If a user is deleted, all their listed items are also deleted automatically.

**`status = 'BLOCKED'`:** Set by staff when an item violates platform rules.

**What if Items did not exist?** Nothing can be rented. The marketplace has no inventory. The entire platform has no purpose.

---

### 6. ItemImages

**Purpose:** Stores one or more image URLs for each item. Separated from Items to allow multiple photos per listing.

| Column | Type | Key | Description |
|---|---|---|---|
| `image_id` | INT AUTO_INCREMENT | **PK** | Unique ID for each image record |
| `item_id` | INT NOT NULL | **FK → Items** | Which item this image belongs to |
| `image_url` | VARCHAR(255) NOT NULL | — | URL path to the stored image file |
| `created_at` | TIMESTAMP | — | When the image was uploaded |

**Why not store images in the Items table?** An item may have 5 photos. Storing them in Items would require 5 columns (`image_url_1`... `image_url_5`) which is bad design. A separate table allows unlimited images per item.

**`ON DELETE CASCADE` on item_id:** If the item is deleted, all its images are automatically removed.

**What if ItemImages did not exist?** Items would either have no photos or be limited to one photo via a single column. Poor user experience — renters cannot properly evaluate items visually.

---

### 7. Bookings

**Purpose:** The core transactional table. Records every rental request made by a renter for an item.

| Column | Type | Key | Description |
|---|---|---|---|
| `booking_id` | INT AUTO_INCREMENT | **PK** | Unique ID for each booking |
| `item_id` | INT NOT NULL | **FK → Items** | Which item is being rented |
| `renter_id` | INT NOT NULL | **FK → Users** | The student renting the item |
| `start_date` | DATE NOT NULL | — | Rental start date |
| `end_date` | DATE NOT NULL | — | Rental end date |
| `returned_date` | DATE DEFAULT NULL | — | Actual date item was returned (NULL until returned) |
| `total_price` | DECIMAL(10,2) NOT NULL | — | Pre-calculated: `daily_rate × (end_date - start_date)` |
| `status` | ENUM('PENDING','APPROVED','REJECTED','COMPLETED','CANCELLED') | — | Current state of the booking |
| `approved_by` | INT DEFAULT NULL | **FK → Staff** | Which staff member approved this booking |
| `approved_at` | TIMESTAMP NULL | — | When the approval happened |
| `created_at` | TIMESTAMP | — | When the booking was made |
| `updated_at` | TIMESTAMP ON UPDATE | — | Last status change time |

**Booking lifecycle:**
```
PENDING → APPROVED → COMPLETED
        → REJECTED
        → CANCELLED
```

**Why store `total_price` separately?** The item's `daily_rate` might change in the future. Storing the price at booking time preserves the original agreed amount.

**`returned_date` vs `end_date`:** `end_date` is the planned return date. `returned_date` records when it was *actually* returned. Late returns = basis for penalties.

**What if Bookings did not exist?** No rentals can happen. There is no transaction record, no way to track who has what item, and no basis for payments, reviews, or disputes.

---

### 8. Payments

**Purpose:** Tracks the payment made for each booking. One booking has one payment record.

| Column | Type | Key | Description |
|---|---|---|---|
| `payment_id` | INT AUTO_INCREMENT | **PK** | Unique payment ID |
| `booking_id` | INT NOT NULL | **FK → Bookings** | Which booking this payment is for |
| `amount` | DECIMAL(10,2) NOT NULL | — | Amount paid (should match `Bookings.total_price`) |
| `status` | ENUM('PENDING','SUCCESS','FAILED','REFUNDED') | — | Payment processing status |
| `method` | VARCHAR(50) | — | Payment method (e.g., bKash, card, cash) |
| `transaction_ref` | VARCHAR(100) UNIQUE | — | External payment gateway reference (unique per transaction) |
| `paid_at` | TIMESTAMP NULL | — | When payment was confirmed |
| `created_at` | TIMESTAMP | — | When payment record was created |

**Why `transaction_ref` is UNIQUE:** Prevents double-recording the same gateway transaction. Essential for financial integrity.

**Why separate from Bookings?** A booking can exist before payment. It may also need refund tracking. Separating concerns is clean design.

**What if Payments did not exist?** The platform cannot process money. No financial records, no refund capability, no proof of payment. The business model fails entirely.

---

### 9. Reviews

**Purpose:** Allows both renters and owners to review each other after a completed booking.

| Column | Type | Key | Description |
|---|---|---|---|
| `review_id` | INT AUTO_INCREMENT | **PK** | Unique ID per review |
| `booking_id` | INT NOT NULL | **FK → Bookings** | The booking this review is based on |
| `reviewer_id` | INT NOT NULL | **FK → Users** | The user writing the review |
| `reviewee_id` | INT NOT NULL | **FK → Users** | The user being reviewed |
| `rating` | INT NOT NULL | — | Numeric rating (e.g., 1 to 5) |
| `comment` | TEXT | — | Written feedback |
| `created_at` | TIMESTAMP | — | When review was submitted |

**Two reviews per booking:** The renter reviews the owner AND the owner reviews the renter — both use this same table, distinguished by `reviewer_id` and `reviewee_id`.

**Note:** There is no CHECK constraint on `rating` in this schema. A production system should add `CHECK (rating BETWEEN 1 AND 5)`.

**What if Reviews did not exist?** No accountability for user behavior, no trust signals for potential renters, and the `trust_score` system loses one of its data sources.

---

### 10. Reports

**Purpose:** Allows users to flag bad content or behavior to staff.

| Column | Type | Key | Description |
|---|---|---|---|
| `report_id` | INT AUTO_INCREMENT | **PK** | Unique ID per report |
| `reporter_id` | INT NOT NULL | **FK → Users** | Who filed the report |
| `entity_type` | ENUM('USER','ITEM','BOOKING') | — | What type of thing is being reported |
| `entity_id` | INT NOT NULL | — | The ID of the reported entity |
| `reason` | TEXT NOT NULL | — | Explanation of why this is being reported |
| `status` | ENUM('PENDING','REVIEWED','RESOLVED') | — | Moderation status |
| `reviewed_by` | INT DEFAULT NULL | **FK → Staff** | Which staff member handled it |
| `reviewed_at` | TIMESTAMP NULL | — | When staff reviewed it |
| `created_at` | TIMESTAMP | — | When report was submitted |

**Polymorphic design:** `entity_type` + `entity_id` together point to any table (USER, ITEM, or BOOKING). This avoids three separate report tables.

**Trade-off:** You cannot use a real foreign key constraint across multiple tables this way. Referential integrity for `entity_id` must be enforced at the application layer.

**What if Reports did not exist?** Users cannot flag rule violations. Staff has no incoming queue of problems to address. Bad actors go unchecked.

---

### 11. Disputes

**Purpose:** Formal conflict records when a renter or owner has a problem with a completed/ongoing booking.

| Column | Type | Key | Description |
|---|---|---|---|
| `dispute_id` | INT AUTO_INCREMENT | **PK** | Unique ID per dispute |
| `booking_id` | INT NOT NULL | **FK → Bookings** | Which booking caused the dispute |
| `raised_by` | INT NOT NULL | **FK → Users** | The user who raised the dispute |
| `status` | ENUM('OPEN','UNDER_REVIEW','RESOLVED','CLOSED') | — | Current state |
| `reason` | TEXT NOT NULL | — | Description of the problem |
| `resolution` | TEXT | — | Staff-written outcome/resolution |
| `created_at` | TIMESTAMP | — | When dispute was filed |
| `resolved_at` | TIMESTAMP NULL | — | When it was officially closed |

**Dispute lifecycle:**
```
OPEN → UNDER_REVIEW → RESOLVED → CLOSED
```

**What if Disputes did not exist?** No formal process for resolving conflicts between users. Staff cannot track or resolve rental disagreements. Disputes become informal, unrecorded chaos.

---

### 12. Penalties

**Purpose:** Financial or administrative penalties issued to users for rule violations, late returns, or lost items.

| Column | Type | Key | Description |
|---|---|---|---|
| `penalty_id` | INT AUTO_INCREMENT | **PK** | Unique penalty ID |
| `user_id` | INT NOT NULL | **FK → Users** | Who is being penalized |
| `booking_id` | INT DEFAULT NULL | **FK → Bookings** | Related booking (if applicable) |
| `dispute_id` | INT DEFAULT NULL | **FK → Disputes** | Related dispute (if applicable) |
| `amount` | DECIMAL(10,2) DEFAULT NULL | — | Fine amount (can be NULL if it's a warning) |
| `reason` | TEXT NOT NULL | — | Why the penalty was issued |
| `status` | ENUM('PENDING','APPLIED','WAIVED') | — | Whether penalty is active or forgiven |
| `issued_by` | INT NOT NULL | **FK → Staff** | Staff who issued the penalty |
| `created_at` | TIMESTAMP | — | When penalty was created |
| `applied_at` | TIMESTAMP NULL | — | When it was enforced |

**`ON DELETE RESTRICT` on `issued_by`:** A staff account cannot be deleted if they have issued penalties. This protects the audit trail.

**Why `booking_id` and `dispute_id` are both optional (NULL):** A penalty might arise from a report, not necessarily a dispute. Flexibility is intentional.

**What if Penalties did not exist?** No mechanism to financially punish bad behavior (late returns, damaged items). The trust system has no enforcement teeth.

---

### 13. TrustEvents

**Purpose:** A full audit history of every change to a user's `trust_score`. This makes the score transparent and traceable.

| Column | Type | Key | Description |
|---|---|---|---|
| `trust_event_id` | INT AUTO_INCREMENT | **PK** | Unique event ID |
| `user_id` | INT NOT NULL | **FK → Users** | Whose trust score changed |
| `change_amount` | INT NOT NULL | — | How much it changed (can be negative) |
| `old_score` | INT NOT NULL | — | Score before the change |
| `new_score` | INT NOT NULL | — | Score after the change |
| `source_type` | ENUM('PENALTY','REVIEW','DISPUTE','REPORT','SYSTEM','STAFF_ACTION') | — | What caused the change |
| `source_id` | INT DEFAULT NULL | — | ID of the source entity (e.g., the penalty_id or review_id) |
| `reason` | VARCHAR(255) NOT NULL | — | Human-readable explanation |
| `created_by` | INT DEFAULT NULL | **FK → Staff** | Staff who triggered it (NULL = system-automated) |
| `created_at` | TIMESTAMP | — | When the event occurred |

**Why record `old_score` and `new_score`?** You can reconstruct the full history without needing to replay events. Also useful for debugging score discrepancies.

**What if TrustEvents did not exist?** Trust scores can still change, but there is no history. A user penalized unfairly has no record to appeal against. Transparency is lost.

---

### 14. AuditLogs

**Purpose:** The master log of all significant actions taken by staff or automated systems. This is the accountability backbone for administrators.

| Column | Type | Key | Description |
|---|---|---|---|
| `audit_id` | INT AUTO_INCREMENT | **PK** | Unique log entry ID |
| `actor_type` | ENUM('STAFF','SYSTEM') | — | Whether a human or automated process did this |
| `actor_id` | INT DEFAULT NULL | **FK → Staff** | Which staff member acted (NULL if SYSTEM) |
| `action_type` | VARCHAR(80) NOT NULL | — | Action name (e.g., `APPROVE_BOOKING`, `BAN_USER`) |
| `entity_type` | VARCHAR(50) NOT NULL | — | What type of object was affected |
| `entity_id` | INT DEFAULT NULL | — | ID of the affected record |
| `outcome` | ENUM('SUCCESS','FAILED','APPROVED','REJECTED','WAIVED','APPLIED') | — | Result of the action |
| `details` | TEXT | — | Extra context, JSON payload, or notes |
| `created_at` | TIMESTAMP | — | When the action occurred |

**Why one audit table for everything?** Having separate audit tables per entity creates redundancy. A single table with `entity_type` + `entity_id` covers all entities cleanly.

**What if AuditLogs did not exist?** No record of who did what and when. A staff member could approve, reject, or ban without accountability. Required for any serious compliance or legal review.

---

## Key Concepts Explained

---

### Primary Key vs Foreign Key

| Concept | Definition | Example |
|---|---|---|
| **Primary Key (PK)** | Uniquely identifies every row in a table. Cannot be NULL, must be unique. | `user_id` in Users |
| **Foreign Key (FK)** | A column that references the PK of another table. Creates a relationship. | `university_id` in Users → `university_id` in Universities |

**Rule:** Every table has exactly one primary key. A table can have zero or many foreign keys.

---

### ON DELETE Behaviors

When a referenced row is deleted, the database must decide what to do with rows that point to it.

| Behavior | Effect | Used When |
|---|---|---|
| `CASCADE` | Delete child rows automatically | Items when User is deleted |
| `SET NULL` | Set FK column to NULL | User's university_id when University is deleted |
| `RESTRICT` | Block deletion if child rows exist | Penalty's issued_by prevents Staff deletion |
| `NO ACTION` | Same as RESTRICT in MySQL | Default |

---

### ENUM Fields

ENUM columns only accept values from a predefined list. Attempting to insert an invalid value will fail.

**Examples:**
- `Users.status` can only be: `'ACTIVE'`, `'SUSPENDED'`, `'BANNED'`
- `Bookings.status` can only be: `'PENDING'`, `'APPROVED'`, `'REJECTED'`, `'COMPLETED'`, `'CANCELLED'`

**Benefit:** Data consistency enforced at the database level.
**Trade-off:** Adding a new allowed value requires an `ALTER TABLE` statement.

---

### Timestamps

| Pattern | Meaning |
|---|---|
| `DEFAULT CURRENT_TIMESTAMP` | Auto-set to current time when row is created |
| `ON UPDATE CURRENT_TIMESTAMP` | Auto-updated whenever any column in the row is modified |
| `TIMESTAMP NULL DEFAULT NULL` | Nullable — starts empty, only set when an event occurs (e.g., `paid_at`, `resolved_at`) |

---

## What Happens If a Table Is Removed?

| Table Removed | Consequence |
|---|---|
| **Universities** | Users lose university association; cannot verify students belong to a campus |
| **Users** | Entire platform fails — no owners, renters, reviewers, or reporters |
| **StudentVerifications** | No ID check; anyone can register and rent without proof of being a real student |
| **Staff** | No moderation, approvals, dispute resolution, or penalty issuance |
| **Items** | Nothing to rent; marketplace has no inventory |
| **ItemImages** | Items lose photos; renters cannot visually evaluate listings |
| **Bookings** | No transactions; platform cannot function as a rental service |
| **Payments** | No money tracking; platform has no financial records or refund capability |
| **Reviews** | No reputation feedback; trust score loses a key input |
| **Reports** | No way to flag bad actors; platform becomes unsafe and unmoderated |
| **Disputes** | No formal conflict resolution process |
| **Penalties** | No enforcement mechanism; trust score changes but nothing forces compliance |
| **TrustEvents** | Trust scores still change but with no history, transparency, or appeal basis |
| **AuditLogs** | Staff actions become unaccountable; compliance and security audits fail |

---

## Indexes — Why They Exist

An index speeds up `WHERE` and `JOIN` queries on that column. Without an index, the database scans every row (full table scan).

| Index | Column(s) | Why |
|---|---|---|
| `idx_users_university_id` | `Users.university_id` | Frequent lookup: all users of a university |
| `idx_items_owner_id` | `Items.owner_id` | Frequent lookup: all items by a user |
| `idx_items_status` | `Items.status` | Filter available items quickly |
| `idx_bookings_item_id` | `Bookings.item_id` | Check if an item is already booked |
| `idx_bookings_renter_id` | `Bookings.renter_id` | Get all bookings of a user |
| `idx_payments_booking_id` | `Payments.booking_id` | Find payment for a booking |
| `idx_reports_status` | `Reports.status` | Staff dashboard: pending reports queue |
| `idx_trustevents_user_id` | `TrustEvents.user_id` | Retrieve full trust history of a user |
| `idx_audit_entity` | `AuditLogs(entity_type, entity_id)` | Find all audit entries for any specific entity |

**Note:** Primary keys are automatically indexed. The indexes above cover foreign keys and frequently filtered columns.

---

## Professor-Style Q&A

---

**Q1: Why is `password_hash` stored instead of the actual password?**
Storing plain-text passwords is a critical security vulnerability. If the database is breached, all accounts are immediately compromised. A hash function (like bcrypt) is one-way — the original password cannot be recovered from the hash. During login, the entered password is hashed and compared.

---

**Q2: Why does `Bookings.total_price` store the price if it can be calculated from `daily_rate × days`?**
Because `Items.daily_rate` can change over time. If the owner raises their rate tomorrow, old bookings would show the wrong price. Storing `total_price` at booking time preserves the agreed-upon amount — a principle called **point-in-time data capture**.

---

**Q3: What is the difference between `Reports` and `Disputes`?**
- A **Report** is a complaint *about* a user, item, or booking filed by any user to staff. It is a moderation tool.
- A **Dispute** is a formal conflict *within* a specific booking — typically between renter and owner — that requires staff mediation and resolution.

---

**Q4: Why does `Reviews` have both `reviewer_id` and `reviewee_id` instead of just linking to `booking_id`?**
One booking produces two possible reviews: the renter reviews the owner, and the owner reviews the renter. Both rows are stored in the same table. `reviewer_id` and `reviewee_id` distinguish direction. Without them, you cannot tell who wrote the review and who it is about.

---

**Q5: Why does `Reports.entity_id` not have a FOREIGN KEY constraint?**
Because it is polymorphic — `entity_id` can reference a User, an Item, or a Booking depending on `entity_type`. MySQL foreign keys must point to exactly one table. Referencing multiple tables with one column is not possible using standard FK constraints. Integrity must be enforced in application code instead.

---

**Q6: What is the purpose of `trust_score` and how is it maintained?**
`trust_score` is a reputation metric starting at 100. It decreases for bad behavior (penalties, disputes, poor reviews) and can increase for good behavior. Every change is recorded in `TrustEvents`. The score itself is stored on the `Users` table for fast access, while `TrustEvents` preserves the full changelog.

---

**Q7: Why does `AuditLogs.actor_type` have both `'STAFF'` and `'SYSTEM'`?**
Some platform actions are automated (e.g., system auto-cancels a booking after 48 hours of no response). These should still be logged, but there is no human staff member to assign. `actor_type = 'SYSTEM'` allows logging such events with `actor_id = NULL`.

---

**Q8: Why is `ON DELETE RESTRICT` used for `Penalties.issued_by`?**
If a staff member is deleted, their issued penalties should not lose context. Using RESTRICT prevents deletion of a staff record if they have issued any penalties. This preserves accountability. Compare this to `ON DELETE SET NULL` used elsewhere — SET NULL is used when the child record can survive without the parent.

---

**Q9: Could Bookings and Payments be merged into one table?**
Technically yes, but it is poor design. A booking can exist before payment (in PENDING state). Payment can also fail and be retried, or be refunded. Keeping them separate follows the Single Responsibility Principle: Bookings track rental logistics, Payments track financial transactions.

---

**Q10: What would you add to improve this schema?**
Possible improvements:
- A `CHECK (rating BETWEEN 1 AND 5)` constraint on `Reviews.rating`
- A `Notifications` table for messaging users about booking status changes
- A `Conversations` or `Messages` table for renter-owner communication
- An `ItemAvailability` table for calendar-based blocking of dates
- Soft delete (`deleted_at` column) instead of hard CASCADE deletes for audit purposes
- A `Wallets` or `Refunds` table for platform credit management

---

*End of ResourceX Database Documentation*