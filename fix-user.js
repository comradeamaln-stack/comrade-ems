import { db } from './src/db/db.js';
import { users } from './src/db/schema.js';

async function checkAndCreateUser() {
    try {
        console.log('Checking for existing users...');
        
        // Check if any users exist
        const existingUsers = await db.query.users.findMany();
        console.log(`Found ${existingUsers.length} users:`, existingUsers);
        
        if (existingUsers.length === 0) {
            console.log('No users found, creating default admin user...');
            const defaultUserId = 'admin-' + Math.random().toString(36).substring(2, 11);
            await db.insert(users).values({
                id: defaultUserId,
                name: "Admin User",
                email: "admin@comradeems.com",
                role: "admin",
                createdAt: new Date()
            });
            console.log(`Created admin user with ID: ${defaultUserId}`);
        } else {
            console.log('Users already exist, using first user:', existingUsers[0]);
        }
        
        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
}

checkAndCreateUser();