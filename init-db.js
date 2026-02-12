import { db } from "./src/lib/db.ts";
import { users } from "./src/db/schema.ts";

async function initDatabase() {
  try {
    console.log("🔍 Checking database initialization...");
    
    // Check if we have any users
    const existingUsers = await db.select().from(users);
    
    if (existingUsers.length === 0) {
      console.log("📝 Creating default users...");
      
      // Create a default admin user
      const adminId = Math.random().toString(36).substring(2, 11);
      await db.insert(users).values({
        id: adminId,
        name: "Admin User",
        email: "admin@comradeems.com",
        role: "admin",
        createdAt: new Date()
      });
      
      // Create a default support staff user
      const staffId = Math.random().toString(36).substring(2, 11);
      await db.insert(users).values({
        id: staffId,
        name: "Support Staff",
        email: "support@comradeems.com", 
        role: "staff",
        createdAt: new Date()
      });
      
      console.log("✅ Created default users");
      console.log(`Admin ID: ${adminId}`);
      console.log(`Staff ID: ${staffId}`);
    } else {
      console.log(`✅ Found ${existingUsers.length} existing users`);
      existingUsers.forEach(user => {
        console.log(`- ${user.name} (${user.email}) - ID: ${user.id}`);
      });
    }
    
    console.log("🎉 Database initialization complete!");
    
  } catch (error) {
    console.error("❌ Database initialization failed:", error);
    process.exit(1);
  }
}

initDatabase().then(() => {
  console.log("✨ Initialization script finished");
  process.exit(0);
});