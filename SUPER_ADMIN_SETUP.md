# SUPER_ADMIN Setup Guide

This guide explains how to bootstrap the initial `SUPER_ADMIN` account in the database.

## Prerequisites

The initial credentials for the `SUPER_ADMIN` are:
- **Name:** Samiul Mirja
- **Email:** saidasanzida@gmail.com
- **Password:** Adminsamiul!1A

Because of the security constraints, the password must never be stored in plain text. It must be hashed using the `BCryptPasswordEncoder` matching the backend authentication system.

## Step 1: Generate Password Hash

A utility class `PasswordHashGenerator` has been provided to easily generate the BCrypt hash.

1. Navigate to the backend directory.
2. Compile and run the `PasswordHashGenerator` with the password:
   ```bash
   mvn compile
   mvn exec:java -Dexec.mainClass="com.resourcex.resourcex.util.PasswordHashGenerator" -Dexec.args="Adminsamiul!1A"
   ```
3. Copy the `Hashed Password` output.

## Step 2: Seed the Database

You can now use your SQL client (e.g. DataGrip, DBeaver, or MySQL CLI) to run the following insert statements. Replace `<HASHED_PASSWORD>` with the value you copied in Step 1.

```sql
-- 1. Insert SUPER_ADMIN role if it does not exist
INSERT IGNORE INTO roles (name) VALUES ('ROLE_SUPER_ADMIN');

-- 2. Create the user
INSERT INTO users (name, email, password, status, created_at, updated_at) 
VALUES ('Samiul Mirja', 'saidasanzida@gmail.com', '<HASHED_PASSWORD>', 'ACTIVE', NOW(), NOW());

-- 3. Assign the role to the user
INSERT INTO user_roles (user_id, role_id)
SELECT u.user_id, r.id 
FROM users u, roles r 
WHERE u.email = 'saidasanzida@gmail.com' AND r.name = 'ROLE_SUPER_ADMIN';
```

## Step 3: Login

You can now log into the application at `/AdminLogin` using:
- **Email:** saidasanzida@gmail.com
- **Password:** Adminsamiul!1A

You will have full `SUPER_ADMIN` access and can use the endpoints provided in `SuperAdminController` to manage other staff members.
