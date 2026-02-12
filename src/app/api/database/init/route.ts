import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// Define table schemas
const STAFF_TABLE = 'staff';
const COLLECTIONS_TABLE = 'collections';

export async function POST(request: NextRequest) {
  try {
    const contentType = request.headers.get('content-type');
    
    if (contentType && contentType.includes('application/json')) {
      const body = await request.json();
      const { action } = body;

      switch (action) {
        case 'init_database':
          // Create tables using SQL
          const { error } = await supabase.rpc('execute_sql', {
            sql: `
              -- Staff table for salesmen management
              CREATE TABLE IF NOT EXISTS ${STAFF_TABLE} (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                name VARCHAR(255) UNIQUE NOT NULL,
                role VARCHAR(100) DEFAULT 'collector',
                phone VARCHAR(50),
                email VARCHAR(255),
                created_at TIMESTAMP DEFAULT NOW()
              );

              -- Collections table with salesman allocation
              CREATE TABLE IF NOT EXISTS ${COLLECTIONS_TABLE} (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                customer_name VARCHAR(255) NOT NULL,
                amount DECIMAL(12,2) NOT NULL,
                collected_amount DECIMAL(12,2) DEFAULT 0,
                due_date DATE NOT NULL,
                status VARCHAR(20) DEFAULT 'pending',
                salesmen_allocations JSONB DEFAULT '[]',
                phone_number VARCHAR(50),
                address TEXT,
                notes TEXT,
                staff_id UUID REFERENCES ${STAFF_TABLE}(id),
                created_at TIMESTAMP DEFAULT NOW(),
                updated_at TIMESTAMP DEFAULT NOW()
              );
            `
          });

          if (error) {
            return NextResponse.json({ 
              error: 'Failed to create tables', 
              status: 500 
            });
          }

          return NextResponse.json({ 
            success: true, 
            message: 'Database structure created successfully',
            tables: [STAFF_TABLE, COLLECTIONS_TABLE]
          });

        case 'check_status':
          // Check if tables exist and get counts
          const [staffResult, collectionsResult] = await Promise.all([
            supabase.from(STAFF_TABLE).select('count'),
            supabase.from(COLLECTIONS_TABLE).select('count')
          ]);

          return NextResponse.json({
            success: true,
            status: 'Database operational',
            tables: {
              staff: staffResult.data?.count || 0,
              collections: collectionsResult.data?.count || 0
            },
            initialized: true
          });

        default:
          return NextResponse.json({ 
            error: 'Invalid action', 
            status: 400 
          });
      }
    } catch (error) {
    console.error('Database init error:', error);
    return NextResponse.json({ 
      error: error.message, 
      stack: error.stack, 
      status: 500 
    });
  }
}