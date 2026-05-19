CREATE TABLE [Users] (
  [user_id] int PRIMARY KEY IDENTITY(1, 1),
  [student_id] nvarchar(255) UNIQUE NOT NULL,
  [name] nvarchar(255) NOT NULL,
  [email] nvarchar(255) UNIQUE NOT NULL,
  [password_hash] nvarchar(255) NOT NULL,
  [phone] nvarchar(255),
  [university_id] int,
  [trust_score] int DEFAULT (100),
  [status] enum(ACTIVE,SUSPENDED,BANNED) DEFAULT 'ACTIVE',
  [created_at] timestamp
)
GO

CREATE TABLE [Roles] (
  [role_id] int PRIMARY KEY IDENTITY(1, 1),
  [name] nvarchar(255) UNIQUE NOT NULL
)
GO

CREATE TABLE [UserRoles] (
  [user_id] int,
  [role_id] int,
  PRIMARY KEY ([user_id], [role_id])
)
GO

CREATE TABLE [Universities] (
  [university_id] int PRIMARY KEY IDENTITY(1, 1),
  [name] nvarchar(255) UNIQUE NOT NULL,
  [domain] nvarchar(255),
  [is_verified] boolean DEFAULT (false),
  [created_at] timestamp
)
GO

CREATE TABLE [Items] (
  [item_id] int PRIMARY KEY IDENTITY(1, 1),
  [owner_id] int,
  [title] nvarchar(255) NOT NULL,
  [description] text,
  [category] nvarchar(255),
  [condition] nvarchar(255),
  [daily_rate] decimal,
  [status] enum(AVAILABLE,UNAVAILABLE,BLOCKED) DEFAULT 'AVAILABLE',
  [is_approved] boolean DEFAULT (false),
  [created_at] timestamp
)
GO

CREATE TABLE [ItemImages] (
  [image_id] int PRIMARY KEY IDENTITY(1, 1),
  [item_id] int,
  [image_url] nvarchar(255)
)
GO

CREATE TABLE [Bookings] (
  [booking_id] int PRIMARY KEY IDENTITY(1, 1),
  [item_id] int,
  [renter_id] int,
  [start_date] date,
  [end_date] date,
  [returned_date] date,
  [total_price] decimal,
  [status] enum(PENDING,APPROVED,REJECTED,COMPLETED,CANCELLED) DEFAULT 'PENDING',
  [approved_by] int,
  [approved_at] timestamp,
  [created_at] timestamp
)
GO

CREATE TABLE [Payments] (
  [payment_id] int PRIMARY KEY IDENTITY(1, 1),
  [booking_id] int,
  [amount] decimal,
  [status] enum(PENDING,SUCCESS,FAILED,REFUNDED) DEFAULT 'PENDING',
  [method] nvarchar(255),
  [transaction_ref] nvarchar(255) UNIQUE,
  [created_at] timestamp
)
GO

CREATE TABLE [Reviews] (
  [review_id] int PRIMARY KEY IDENTITY(1, 1),
  [booking_id] int,
  [reviewer_id] int,
  [reviewee_id] int,
  [rating] int,
  [comment] text,
  [created_at] timestamp
)
GO

CREATE TABLE [TrustLogs] (
  [log_id] int PRIMARY KEY IDENTITY(1, 1),
  [user_id] int,
  [change_amount] int,
  [reason] nvarchar(255),
  [created_at] timestamp
)
GO

CREATE TABLE [ApprovalLogs] (
  [approval_id] int PRIMARY KEY IDENTITY(1, 1),
  [entity_type] enum(USER,ITEM,UNIVERSITY),
  [entity_id] int,
  [status] enum(APPROVED,REJECTED),
  [reviewed_by] int,
  [reviewed_at] timestamp,
  [note] text
)
GO

CREATE TABLE [Reports] (
  [report_id] int PRIMARY KEY IDENTITY(1, 1),
  [reporter_id] int,
  [entity_type] enum(USER,ITEM,BOOKING),
  [entity_id] int,
  [reason] text,
  [status] enum(PENDING,REVIEWED,RESOLVED) DEFAULT 'PENDING',
  [reviewed_by] int,
  [reviewed_at] timestamp,
  [created_at] timestamp
)
GO

CREATE TABLE [AdminLogs] (
  [log_id] int PRIMARY KEY IDENTITY(1, 1),
  [admin_id] int,
  [action] nvarchar(255),
  [entity_type] nvarchar(255),
  [entity_id] int,
  [details] text,
  [created_at] timestamp
)
GO

ALTER TABLE [Users] ADD FOREIGN KEY ([university_id]) REFERENCES [Universities] ([university_id])
GO

ALTER TABLE [UserRoles] ADD FOREIGN KEY ([user_id]) REFERENCES [Users] ([user_id])
GO

ALTER TABLE [UserRoles] ADD FOREIGN KEY ([role_id]) REFERENCES [Roles] ([role_id])
GO

ALTER TABLE [Items] ADD FOREIGN KEY ([owner_id]) REFERENCES [Users] ([user_id])
GO

ALTER TABLE [ItemImages] ADD FOREIGN KEY ([item_id]) REFERENCES [Items] ([item_id])
GO

ALTER TABLE [Bookings] ADD FOREIGN KEY ([item_id]) REFERENCES [Items] ([item_id])
GO

ALTER TABLE [Bookings] ADD FOREIGN KEY ([renter_id]) REFERENCES [Users] ([user_id])
GO

ALTER TABLE [Bookings] ADD FOREIGN KEY ([approved_by]) REFERENCES [Users] ([user_id])
GO

ALTER TABLE [Payments] ADD FOREIGN KEY ([booking_id]) REFERENCES [Bookings] ([booking_id])
GO

ALTER TABLE [Reviews] ADD FOREIGN KEY ([booking_id]) REFERENCES [Bookings] ([booking_id])
GO

ALTER TABLE [Reviews] ADD FOREIGN KEY ([reviewer_id]) REFERENCES [Users] ([user_id])
GO

ALTER TABLE [Reviews] ADD FOREIGN KEY ([reviewee_id]) REFERENCES [Users] ([user_id])
GO

ALTER TABLE [TrustLogs] ADD FOREIGN KEY ([user_id]) REFERENCES [Users] ([user_id])
GO

ALTER TABLE [ApprovalLogs] ADD FOREIGN KEY ([reviewed_by]) REFERENCES [Users] ([user_id])
GO

ALTER TABLE [Reports] ADD FOREIGN KEY ([reporter_id]) REFERENCES [Users] ([user_id])
GO

ALTER TABLE [Reports] ADD FOREIGN KEY ([reviewed_by]) REFERENCES [Users] ([user_id])
GO

ALTER TABLE [AdminLogs] ADD FOREIGN KEY ([admin_id]) REFERENCES [Users] ([user_id])
GO
