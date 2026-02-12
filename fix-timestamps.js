import Database from "better-sqlite3";

const db = new Database("sqlite.db");

// Update existing enquiries to have proper timestamps
try {
    // Get current timestamp
    const now = Math.floor(Date.now() / 1000);

    // Update all enquiries that have null or invalid timestamps
    db.prepare(`
    UPDATE enquiries 
    SET created_at = ?, updated_at = ?
    WHERE created_at IS NULL OR created_at = 0
  `).run(now, now);

    console.log("✅ Database timestamps updated successfully!");
    console.log("All existing enquiries now have proper timestamps.");
} catch (error) {
    console.error("Error updating database:", error);
}

db.close();
