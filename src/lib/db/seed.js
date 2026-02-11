import fs from "fs";
import path from "path";
import { withTransaction } from "./pool.js";
import { hashPassword } from "@/lib/crypto.js";

const seedJsonData = async () => {
  const filePath = path.resolve(process.cwd(), "insert.json");
  const data = JSON.parse(fs.readFileSync(filePath, "utf-8"));

  return withTransaction(async (client) => {
    if (data.users) {
      for (const user of data.users) {
        const secureHash = await hashPassword(user.password_hash);
        
        await client.query(
          `INSERT INTO users (id, name, email, password_hash, role) 
           VALUES ($1, $2, $3, $4, $5) ON CONFLICT (id) DO NOTHING`,
          [user.id, user.name, user.email, secureHash, user.role]
        );
      }
    }

    if (data.students) {
      for (const s of data.students) {
        await client.query(
          `INSERT INTO students (user_id, age, country, skill_level, category) 
           VALUES ($1, $2, $3, $4, $5) ON CONFLICT DO NOTHING`,
          [s.user_id, s.age, s.country, s.skill_level, s.category]
        );
      }
    }

    if (data.instructors) {
      for (const i of data.instructors) {
        await client.query(
          `INSERT INTO instructors (user_id, experience) 
           VALUES ($1, $2) ON CONFLICT DO NOTHING`,
          [i.user_id, i.experience]
        );
      }
    }

    if (data.partner_university) {
      for (const u of data.partner_university) {
        await client.query(
          `INSERT INTO partner_university (id, name, country) 
           VALUES ($1, $2, $3) ON CONFLICT (id) DO NOTHING`,
          [u.id, u.name, u.country]
        );
      }
    }

    if (data.textbooks) {
      for (const b of data.textbooks) {
        await client.query(
          `INSERT INTO textbooks (id, title, author) 
           VALUES ($1, $2, $3) ON CONFLICT (id) DO NOTHING`,
          [b.id, b.title, b.author]
        );
      }
    }

    if (data.topics) {
      for (const t of data.topics) {
        await client.query(
          `INSERT INTO topics (id, name) 
           VALUES ($1, $2) ON CONFLICT (id) DO NOTHING`,
          [t.id, t.name]
        );
      }
    }

    if (data.courses) {
      for (const c of data.courses) {
        await client.query(
          `INSERT INTO courses (id, name, description, program_type, duration, university_id, book_id) 
           VALUES ($1, $2, $3, $4, $5, $6, $7) ON CONFLICT (id) DO NOTHING`,
          [c.id, c.name, c.description, c.program_type, c.duration, c.university_id, c.book_id]
        );
      }
    }

    if (data.contents) {
      for (const ct of data.contents) {
        await client.query(
          `INSERT INTO contents (id, course_id, type, body) 
           VALUES ($1, $2, $3, $4) ON CONFLICT (id) DO NOTHING`,
          [ct.id, ct.course_id, ct.type, ct.body]
        );
      }
    }

    if (data.course_topics) {
      for (const ct of data.course_topics) {
        await client.query(
          `INSERT INTO course_topics (course_id, topic_id) VALUES ($1, $2) ON CONFLICT DO NOTHING`,
          [ct.course_id, ct.topic_id]
        );
      }
    }

    if (data.teaches) {
      for (const t of data.teaches) {
        await client.query(
          `INSERT INTO teaches (instructor_id, course_id) VALUES ($1, $2) ON CONFLICT DO NOTHING`,
          [t.instructor_id, t.course_id]
        );
      }
    }

    if (data.enrollments) {
      for (const e of data.enrollments) {
        await client.query(
          `INSERT INTO enrollments (student_id, course_id, marks) VALUES ($1, $2, $3) ON CONFLICT DO NOTHING`,
          [e.student_id, e.course_id, e.marks]
        );
      }
    }

    console.log("JSON data seeded and passwords hashed successfully");
  });
};

const runSeeds = async () => {
  try {
    await seedJsonData();
  } catch (err) {
    console.error("Seeding failed", {
      message: err.message,
      code: err.code,
    });
    process.exit(1);
  }
};

export default runSeeds;