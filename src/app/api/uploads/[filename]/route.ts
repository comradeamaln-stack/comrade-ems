import { NextRequest, NextResponse } from 'next/server';
import { join } from 'path';
import { readFile } from 'fs/promises';

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ filename: string }> }
) {
  try {
    const { filename } = await context.params;
    
    // Security check: prevent path traversal attacks
    if (filename.includes('..') || filename.includes('/') || filename.includes('\\')) {
      return NextResponse.json({ error: 'Invalid filename' }, { status: 400 });
    }

    // Try to find the file in multiple possible locations
    const possiblePaths = [
      join(process.cwd(), 'public', 'uploads', filename),
      join(process.cwd(), 'uploads', filename),
      join(process.cwd(), 'temp', filename),
      join(process.cwd(), 'tmp', filename),
    ];

    let fileData = null;
    let filePath = null;

    for (const path of possiblePaths) {
      try {
        fileData = await readFile(path);
        filePath = path;
        break;
      } catch (error) {
        // Continue to next path
        continue;
      }
    }

    if (!fileData) {
      // Create a placeholder for missing files
      const originalName = filename.replace(/^\d+-/, '').replace(/_/g, ' ').replace(/\.[^/.]+$/, '');
      
      const placeholderImage = `
        <svg width="400" height="300" xmlns="http://www.w3.org/2000/svg">
          <rect width="400" height="300" fill="#f3f4f6"/>
          <rect x="50" y="75" width="300" height="150" rx="8" fill="#e5e7eb" stroke="#d1d5db" stroke-width="2" stroke-dasharray="5,5"/>
          <text x="200" y="150" text-anchor="middle" fill="#6b7280" font-family="Arial, sans-serif" font-size="14">
            📷
          </text>
          <text x="200" y="175" text-anchor="middle" fill="#9ca3af" font-family="Arial, sans-serif" font-size="12">
            Image File Not Found
          </text>
          <text x="200" y="195" text-anchor="middle" fill="#6b7280" font-family="Arial, sans-serif" font-size="10">
            ${filename}
          </text>
          <text x="200" y="250" text-anchor="middle" fill="#f59e0b" font-family="Arial, sans-serif" font-size="11" font-weight="bold">
            The file may not have been uploaded yet
          </text>
        </svg>
      `;
      
      return new NextResponse(placeholderImage, {
        headers: {
          'Content-Type': 'image/svg+xml',
          'Cache-Control': 'no-cache'
        }
      });
    }

    // Determine content type
    const ext = filename.split('.').pop()?.toLowerCase();
    const contentTypes: Record<string, string> = {
      'jpg': 'image/jpeg',
      'jpeg': 'image/jpeg',
      'png': 'image/png',
      'gif': 'image/gif',
      'webp': 'image/webp',
      'svg': 'image/svg+xml',
      'pdf': 'application/pdf',
      'txt': 'text/plain',
      'doc': 'application/msword',
      'docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'xls': 'application/vnd.ms-excel',
      'xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    };

    const contentType = contentTypes[ext || ''] || 'application/octet-stream';

    return new NextResponse(fileData, {
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=3600', // Cache for 1 hour
        'Access-Control-Allow-Origin': '*'
      }
    });

  } catch (error) {
    console.error('File serving error:', error);
    return NextResponse.json({ error: 'File not found' }, { status: 404 });
  }
}