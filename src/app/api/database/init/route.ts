import { NextRequest, NextResponse } from 'next/server';
import Database from 'better-sqlite3';
import { join } from 'path';

export async function POST(request: NextRequest) {
  try {
    const contentType = request.headers.get('content-type');
    
    if (contentType && contentType.includes('application/json')) {
      const body = await request.json();
      const { action } = body;

      const db = new Database(join(process.cwd(), 'sqlite.db'));

      switch (action) {
        case 'init_database':
          // Create tables using SQLite
          try {
            db.exec(`
              CREATE TABLE IF NOT EXISTS staff (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT UNIQUE NOT NULL,
                role TEXT DEFAULT 'collector',
                phone TEXT,
                email TEXT,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
              );

              CREATE TABLE IF NOT EXISTS collections (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                customer_name TEXT NOT NULL,
                amount REAL NOT NULL,
                collected_amount REAL DEFAULT 0,
                due_date TEXT NOT NULL,
                status TEXT DEFAULT 'pending',
                phone_number TEXT,
                address TEXT,
                notes TEXT,
                staff_id INTEGER,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (staff_id) REFERENCES staff (id)
              );
            `);

            return NextResponse.json({ 
              success: true, 
              message: 'Database structure created successfully',
              tables: ['staff', 'collections']
            });
          } catch (error) {
            return NextResponse.json({ 
              error: 'Failed to create tables: ' + (error as Error).message, 
              status: 500 
            });
          }

        case 'check_status':
          // Check if tables exist and get counts
          try {
            const staffCount = db.prepare('SELECT COUNT(*) as count FROM staff').get() as { count: number };
            const collectionsCount = db.prepare('SELECT COUNT(*) as count FROM collections').get() as { count: number };

            return NextResponse.json({
              success: true,
              status: 'Database operational',
              tables: {
                staff: staffCount.count || 0,
                collections: collectionsCount.count || 0
              },
              initialized: true
            });
          } catch (error) {
            return NextResponse.json({ 
              error: 'Database check failed: ' + (error as Error).message, 
              status: 500 
            });
          }

        default:
          return NextResponse.json({ 
            error: 'Invalid action', 
            status: 400 
          });
      }
    } else {
      return NextResponse.json({ 
        error: 'Invalid content type', 
        status: 400 
      });
    }
  } catch (error) {
    console.error('Database init error:', error);
    return NextResponse.json({ 
      error: (error as Error).message, 
      stack: (error as Error).stack, 
      status: 500 
    });
  }
}