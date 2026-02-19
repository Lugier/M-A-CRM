# Database Connection Fix (Supabase)

This document explains how the connection to Supabase was restored and how the setup works now.

## 🚨 The Core Problem
1. **Local DNS Failure**: Your computer could not resolve the hostname `db.urfflntfcztmvhcsckqv.supabase.co` to an IP address.
2. **Wrong Region Assumption**: Initial fixes targeted the `EU-Central-1` (Frankfurt) pooler, but your project is located in **`EU-West-1` (Ireland)**.
3. **Connection Mode Mismatch**: Schema changes require **Session Mode (Port 5432)**, while the running application needs **Transaction Mode (Port 6543)** for stability.

## ✅ The Solution Applied

### 1. Direct IP Address
We identified the correct IP address for your project's pooler:
- **IP**: `18.202.64.2` (EU-West-1 Pooler)
- **Hostname**: `aws-1-eu-west-1.pooler.supabase.com`

### 2. DNS Override (HOSTS File)
We added an entry to your Windows `hosts` file (`C:\Windows\System32\drivers\etc\hosts`) to force the correct resolution:
```text
18.202.64.2 db.urfflntfcztmvhcsckqv.supabase.co
```
**Benefit:** This allows your existing scripts using the hostname to work without modification.

### 3. Application Configuration (.env)
The `.env` file was updated to use **Direct Connection (Port 5432)** because the Transaction Pooler (6543) was unreachable from your computer:
```env
DATABASE_URL="postgresql://postgres.urfflntfcztmvhcsckqv:[PASSWORD]@18.202.64.2:5432/postgres"
```
- **Port 5432**: Direct Session Mode (more stable if 6543 is blocked)
- **Note**: If you face "too many connections" errors, verify that 6543 is open in your firewall and switch back.

### 4. Schema Updates (Migrations)
Schema updates (like `prisma db push`) **MUST** use the Direct Connection (Session Mode) on Port 5432.
- I created a helper script `fix-schema-sync.js` that automatically uses **Port 5432** for schema pushes.
- **Why?** The Transaction Pooler (6543) does not support the commands needed to alter tables.

## 🛠 Troubleshooting Guide

### "Can't reach database server"
- Check if the IP `18.202.64.2` is reachable (Ping test).
- Verify the `hosts` file entry still exists.

### "Invalid invocation" or "Prepared statement" errors
- Ensure the app connects to **Port 6543** with `pgbouncer=true`.
- Ensure schema migrations run on **Port 5432**.

### Adding New Database Columns
If you change `schema.prisma`:
1. Start the dev server (`npm run dev`) - it often handles safe pushes.
2. If that fails, run: `node fix-schema-sync.js`
   *(This script forces the connection via Port 5432 to apply changes safely)*
