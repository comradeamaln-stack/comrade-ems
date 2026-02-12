import { NextRequest, NextResponse } from 'next/server';
import Database from 'better-sqlite3';
import { join } from 'path';
import { randomUUID } from 'crypto';

export async function POST(request: NextRequest) {
  try {
    const db = new Database(join(process.cwd(), 'sqlite.db'));
    
    // Create admin user
    const adminUser = {
      id: randomUUID(),
      name: 'Admin User',
      email: 'comradeadmin@gmail.com',
      password: 'admin123',
      role: 'admin',
      designation: 'manager',
      status: 'active'
    };

    // Insert admin user
    const insertUser = db.prepare(`
      INSERT OR IGNORE INTO users (id, name, email, password, role, designation, status)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);

    insertUser.run(
      adminUser.id,
      adminUser.name,
      adminUser.email,
      adminUser.password,
      adminUser.role,
      adminUser.designation,
      adminUser.status
    );

    return NextResponse.json({ 
      success: true, 
      message: 'Admin user created successfully',
      user: {
        email: adminUser.email,
        password: adminUser.password
      }
    });

  } catch (error) {
    console.error('Create admin error:', error);
    return NextResponse.json({ 
      error: (error as Error).message,
      status: 500 
    });
  }
}