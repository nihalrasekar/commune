# Property Super App - Normalized Database Schema

This project now uses a fully normalized database schema designed for scalability and data integrity.

## 🗄️ Database Architecture

### Core Design Principles

1. **Normalization**: Reduced data redundancy through proper table relationships
2. **Scalability**: Support for multiple apartments/buildings in a single system
3. **Data Integrity**: Foreign key constraints and proper data validation
4. **Security**: Row Level Security (RLS) policies for data protection
5. **Performance**: Optimized indexes for common query patterns

### Database Tables

#### Core Tables
- **apartments**: Master building/complex information
- **user_profiles**: User information with apartment references
- **properties**: Individual property units within apartments

#### Transaction Tables
- **payments**: All payment transactions with categories
- **payment_categories**: Recurring and one-time payment types

#### Service Management
- **service_categories**: Service classification
- **services**: Available services with provider details
- **service_bookings**: Service booking records

#### Community Features
- **community_posts**: Forum posts with categories
- **community_post_categories**: Post classification
- **community_post_likes**: Post engagement tracking
- **community_post_comments**: Threaded comments system

#### Operations
- **visitor_entries**: Visitor management system
- **maintenance_requests**: Maintenance and repair tracking
- **maintenance_categories**: Request classification

#### Utilities
- **utility_types**: Utility service definitions
- **utility_usage**: Consumption tracking and billing

#### Vehicle Charging
- **charging_stations**: EV charging infrastructure
- **charging_sessions**: Usage tracking and billing

### Key Features

#### Multi-Apartment Support
The schema supports multiple apartment complexes in a single system:
```sql
-- Each user belongs to an apartment
user_profiles.apartment_id -> apartments.id

-- Properties are organized by apartment
properties.apartment_id -> apartments.id

-- All transactions are apartment-scoped
payments.apartment_id -> apartments.id
```

#### Flexible Payment System
Supports both recurring and one-time payments:
```sql
-- Recurring payments (rent, utilities)
payment_categories.is_recurring = true
payment_categories.due_day = 5  -- 5th of every month

-- One-time payments (deposits, fees)
payment_categories.is_recurring = false
```

#### Comprehensive Service Management
Full service lifecycle from booking to completion:
```sql
-- Service discovery
services -> service_categories

-- Booking management
service_bookings -> services -> users

-- Payment tracking
service_bookings.payment_status
```

#### Advanced Community Features
Rich community interaction system:
```sql
-- Threaded comments
community_post_comments.parent_comment_id -> community_post_comments.id

-- Engagement tracking
community_posts.likes_count, comments_count, views_count

-- Content moderation
community_posts.status (active, archived, deleted)
```

## 🔧 Setup Instructions

### 1. Supabase Project Setup

#### Step 1: Create New Supabase Project
1. Go to [https://supabase.com/dashboard](https://supabase.com/dashboard)
2. Click "New Project"
3. Select your NEW organization
4. Choose a project name (e.g., "property-super-app")
5. Set a strong database password
6. Select your preferred region
7. Click "Create new project"

#### Step 2: Get Your Project Credentials
1. Once your project is created, go to **Settings > API**
2. Copy the following values:
   - **Project URL** (e.g., `https://abcdefgh.supabase.co`)
   - **anon/public key** (starts with `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`)

#### Step 3: Update Configuration
1. Open `lib/supabase.ts`
2. Replace `YOUR_NEW_PROJECT_URL_HERE` with your Project URL
3. Replace `YOUR_NEW_ANON_KEY_HERE` with your anon/public key

### 2. Database Setup

Run the schema creation script in your Supabase SQL editor:

1. Go to **SQL Editor** in your Supabase dashboard
2. Create a new query
3. Copy and paste the contents from `supabase/migrations/20250629090407_maroon_villa.sql`
4. Click "Run" to create all tables, indexes, and RLS policies
5. Then copy and paste the contents from `supabase/migrations/20250629090513_pink_wildflower.sql`
6. Click "Run" to populate with seed data

### 3. Environment Configuration (Optional)

For better security, you can use environment variables:

1. Copy `.env.example` to `.env`
2. Fill in your actual Supabase credentials
3. Update `lib/supabase.ts` to use environment variables:

```typescript
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!;
```

### 4. Test the Connection

1. Start your development server: `npm run dev`
2. Try to sign up with a new account
3. Check your Supabase dashboard > Authentication > Users to see if the user was created
4. Check the `user_profiles` table to see if the profile was created

## 🔒 Security Features

### Row Level Security (RLS)
- Users can only access data from their apartment
- Personal data is restricted to the owner
- Admin roles can be implemented for management access

### Data Validation
- Check constraints on critical fields
- Foreign key relationships ensure data integrity
- Proper data types and constraints

### Audit Trail
- `created_at` and `updated_at` timestamps on all tables
- Automatic timestamp updates via triggers
- Comprehensive logging capabilities

## 🚀 Performance Optimizations

### Indexes
- Primary keys and foreign keys automatically indexed
- Additional indexes on frequently queried columns
- Composite indexes for complex queries

### Query Optimization
- Pre-built query functions in `lib/supabase-queries.ts`
- Efficient joins and data fetching patterns
- Pagination support for large datasets

## 📈 Scalability Considerations

### Horizontal Scaling
- Apartment-based data partitioning
- Independent apartment operations
- Multi-tenant architecture ready

### Vertical Scaling
- Optimized query patterns
- Efficient data structures
- Minimal data redundancy

## 🔧 Troubleshooting

### Common Issues

1. **"Invalid API key" error**
   - Double-check your anon key is correct
   - Make sure you're using the key from the correct project

2. **"Project not found" error**
   - Verify your project URL is correct
   - Ensure the project is in the right organization

3. **Database connection issues**
   - Make sure you've run both migration files
   - Check that RLS policies are enabled

4. **Authentication not working**
   - Verify email confirmation is disabled in Auth settings
   - Check that the user_profiles table exists

### Getting Help

If you're still having issues:
1. Check the Supabase logs in your dashboard
2. Verify your project is in the correct organization
3. Make sure all migration scripts have been run successfully

This normalized schema provides a solid foundation for a production-ready property management super app with room for future enhancements and scaling.#   c o m m u n e  
 