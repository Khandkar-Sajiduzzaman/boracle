// seed.js - PostgreSQL Seed Script for BRACU Oracle
// Run with: node seed.js

import { sql, tx } from '../lib/pgdb.js';

// Helper function to generate BRACU email
function generateBracuEmail(name) {
  return `${name.toLowerCase().replace(/\s/g, '.')}@g.bracu.ac.bd`;
}

// Helper function to generate random semester
function generateSemester() {
  const seasons = ['SPRING', 'SUMMER', 'FALL'];
  const year = Math.floor(Math.random() * 5) + 22; // 22-26
  return `${seasons[Math.floor(Math.random() * 3)]}${year.toString().padStart(2, '0')}`;
}

// Helper function to generate course codes
function generateCourseCode() {
  const departments = ['CSE', 'EEE', 'MAT', 'PHY', 'ENG', 'BUS', 'ECO', 'MIC'];
  const dept = departments[Math.floor(Math.random() * departments.length)];
  const number = Math.floor(Math.random() * 400) + 100;
  return `${dept}${number}`;
}

// Helper to get current epoch time
function getCurrentEpoch() {
  return Math.floor(Date.now() / 1000);
}

// Helper to create base64 encoded arrays of section IDs
function encodeRoutine(sectionIds) {
  return Buffer.from(JSON.stringify(sectionIds)).toString('base64');
}

async function seedDatabase() {
  try {
    console.log('Starting database seeding...');

    // ===== 1. SEED USERINFO =====
    console.log('Seeding userinfo...');
    
    // First, insert the deleted user placeholder
    await sql`
      INSERT INTO userinfo (email, userName, userRole, createdAt) 
      VALUES ('deleted@g.bracu.ac.bd', 'Deleted User', 'student', ${getCurrentEpoch()})
      ON CONFLICT (email) DO NOTHING
    `;

    const users = [
      { email: generateBracuEmail('john.doe'), userName: 'John Doe', userRole: 'student' },
      { email: generateBracuEmail('jane.smith'), userName: 'Jane Smith', userRole: 'student' },
      { email: generateBracuEmail('admin.user'), userName: 'Admin User', userRole: 'admin' },
      { email: generateBracuEmail('mod.sarah'), userName: 'Sarah Moderator', userRole: 'moderator' },
      { email: generateBracuEmail('alice.wong'), userName: 'Alice Wong', userRole: 'student' },
      { email: generateBracuEmail('bob.johnson'), userName: 'Bob Johnson', userRole: 'student' },
      { email: generateBracuEmail('charlie.brown'), userName: 'Charlie Brown', userRole: 'student' },
      { email: generateBracuEmail('diana.prince'), userName: 'Diana Prince', userRole: 'moderator' },
      { email: generateBracuEmail('erik.magnus'), userName: 'Erik Magnus', userRole: 'student' },
      { email: generateBracuEmail('fiona.green'), userName: 'Fiona Green', userRole: 'student' }
    ];

    for (const user of users) {
      await sql`
        INSERT INTO userinfo (email, userName, userRole, createdAt) 
        VALUES (${user.email}, ${user.userName}, ${user.userRole}, ${getCurrentEpoch()})
        ON CONFLICT (email) DO NOTHING
      `;
    }
    console.log(`Inserted ${users.length + 1} users`);

    // ===== 2. SEED FACULTY =====
    console.log('Seeding faculty...');
    
    const facultyData = [
      { 
        facultyName: 'Dr. Ahmed Rahman', 
        email: 'ahmed.rahman@bracu.ac.bd',
        imgURL: 'https://example.com/faculty/ahmed.jpg',
        initials: ['ARN', 'AR']
      },
      { 
        facultyName: 'Dr. Sarah Khan', 
        email: 'sarah.khan@bracu.ac.bd',
        imgURL: 'https://example.com/faculty/sarah.jpg',
        initials: ['SKH', 'SK']
      },
      { 
        facultyName: 'Prof. Michael Chen', 
        email: 'michael.chen@bracu.ac.bd',
        imgURL: null,
        initials: ['MCH', 'MC']
      },
      { 
        facultyName: 'Dr. Fatima Begum', 
        email: 'fatima.begum@bracu.ac.bd',
        imgURL: 'https://example.com/faculty/fatima.jpg',
        initials: ['FBG', 'FB']
      },
      { 
        facultyName: 'Prof. Robert Williams', 
        email: 'robert.williams@bracu.ac.bd',
        imgURL: 'https://example.com/faculty/robert.jpg',
        initials: ['RWL', 'RW']
      }
    ];

    const facultyIds = [];
    for (const fac of facultyData) {
      const result = await sql`
        INSERT INTO faculty (facultyName, email, imgURL) 
        VALUES (${fac.facultyName}, ${fac.email}, ${fac.imgURL})
        RETURNING facultyID
      `;
      
      if (result && result[0]) {
        facultyIds.push(result[0].facultyid);
        
        // Insert initials for this faculty
        for (const initial of fac.initials) {
          await sql`
            INSERT INTO initial (facultyID, facultyInitial) 
            VALUES (${result[0].facultyid}, ${initial})
            ON CONFLICT (facultyID, facultyInitial) DO NOTHING
          `;
        }
      }
    }
    console.log(`Inserted ${facultyData.length} faculty members with initials`);

    // ===== 3. SEED SAVED ROUTINES =====
    console.log('Seeding saved routines...');
    
    const routines = [
      {
        routineStr: encodeRoutine([180845, 180379, 179168, 179167, 179166]),
        email: users[0].email
      },
      {
        routineStr: encodeRoutine([180845, 179168, 179166]),
        email: users[1].email
      },
      {
        routineStr: encodeRoutine([180379, 179167, 180845, 179168]),
        email: users[4].email
      }
    ];

    for (const routine of routines) {
      await sql`
        INSERT INTO savedroutine (routineStr, email) 
        VALUES (${routine.routineStr}, ${routine.email})
      `;
    }
    console.log(`Inserted ${routines.length} saved routines`);

    // ===== 4. SEED COURSE SWAPS =====
    console.log('Seeding course swaps...');
    
    const swaps = [
      {
        isDone: false,
        uEmail: users[0].email,
        getSectionID: 180845,
        askSectionID: 180379
      },
      {
        isDone: false,
        uEmail: users[1].email,
        getSectionID: 179168,
        askSectionID: 179167
      },
      {
        isDone: true,
        uEmail: users[4].email,
        getSectionID: 179166,
        askSectionID: 180845
      }
    ];

    for (const swap of swaps) {
      await sql`
        INSERT INTO courseSwap (isDone, uEmail, getSectionID, askSectionID, createdAt) 
        VALUES (${swap.isDone}, ${swap.uEmail}, ${swap.getSectionID}, 
                ${swap.askSectionID}, ${getCurrentEpoch()})
      `;
    }
    console.log(`Inserted ${swaps.length} course swaps`);

    // ===== 5. SEED REVIEWS =====
    console.log('Seeding reviews...');
    
    const reviewIds = [];
    for (let i = 0; i < 15; i++) {
      const review = {
        facultyID: facultyIds[i % facultyIds.length],
        uEmail: users[i % users.length].email,
        isAnon: i % 3 === 0,
        semester: generateSemester(),
        behaviourRating: Math.floor(Math.random() * 4) + 7, // 7-10
        teachingRating: Math.floor(Math.random() * 5) + 6,  // 6-10
        markingRating: Math.floor(Math.random() * 6) + 5,   // 5-10
        section: (i % 9 + 1).toString(),
        courseCode: generateCourseCode(),
        reviewDescription: `This is a sample review ${i + 1}. The professor was very helpful and knowledgeable.`,
        postState: ['pending', 'published', 'rejected'][i % 3]
      };

      const result = await sql`
        INSERT INTO reviews (facultyID, uEmail, isAnon, semester, behaviourRating, 
                           teachingRating, markingRating, section, courseCode, reviewDescription, 
                           postState, createdAt) 
        VALUES (${review.facultyID}, ${review.uEmail}, ${review.isAnon}, 
                ${review.semester}, ${review.behaviourRating}, ${review.teachingRating}, 
                ${review.markingRating}, ${review.section}, ${review.courseCode}, 
                ${review.reviewDescription}, ${review.postState}, ${getCurrentEpoch()})
        RETURNING reviewID
      `;
      
      if (result && result[0]) {
        reviewIds.push(result[0].reviewid);
      }
    }
    console.log(`Inserted ${reviewIds.length} reviews`);

    // ===== 6. SEED COURSE MATERIALS =====
    console.log('Seeding course materials...');
    
    const materialIds = [];
    for (let i = 0; i < 10; i++) {
      const material = {
        uEmail: users[i % users.length].email,
        materialURL: `https://drive.google.com/file/d/sample${i + 1}/view`,
        courseCode: generateCourseCode(),
        semester: generateSemester(),
        postState: ['pending', 'published', 'rejected'][i % 3],
        postDescription: `Lecture notes and slides for week ${i + 1}. Very comprehensive material covering all topics.`
      };

      const result = await sql`
        INSERT INTO courseMaterials (uEmail, materialURL, createdAt, courseCode, 
                                    semester, postState, postDescription) 
        VALUES (${material.uEmail}, ${material.materialURL}, 
                ${getCurrentEpoch()}, ${material.courseCode}, ${material.semester}, 
                ${material.postState}, ${material.postDescription})
        RETURNING materialID
      `;
      
      if (result && result[0]) {
        materialIds.push(result[0].materialid);
      }
    }
    console.log(`Inserted ${materialIds.length} course materials`);

    // ===== 7. SEED MODERATION LOGS =====
    console.log('Seeding moderation logs...');
    
    // Moderate some reviews
    const moderatorEmails = [users[2].email, users[3].email, users[7].email]; // admin and moderators
    let reviewModCount = 0;
    
    for (let i = 0; i < Math.min(5, reviewIds.length); i++) {
      const epochTime = getCurrentEpoch() + i; // Slightly different times to avoid PK conflicts
      await sql`
        INSERT INTO moderatesReview (reviewID, moderatorEmail, moderatedAt, comment, decisionState) 
        VALUES (${reviewIds[i]}, ${moderatorEmails[i % 3]}, ${epochTime}, 
                ${'Review moderation comment ' + (i + 1)}, 
                ${['pending', 'published', 'rejected'][i % 3]})
        ON CONFLICT (reviewID, moderatorEmail, moderatedAt) DO NOTHING
      `;
      reviewModCount++;
    }
    console.log(`Inserted ${reviewModCount} review moderations`);

    // Moderate some materials
    let materialModCount = 0;
    for (let i = 0; i < Math.min(3, materialIds.length); i++) {
      const epochTime = getCurrentEpoch() + i;
      await sql`
        INSERT INTO moderatesCourseMaterials (materialID, moderatorEmail, moderatedAt, comment, decisionState) 
        VALUES (${materialIds[i]}, ${moderatorEmails[i % 3]}, ${epochTime}, 
                ${'Material moderation comment ' + (i + 1)}, 
                ${['published', 'rejected', 'pending'][i % 3]})
        ON CONFLICT (materialID, moderatorEmail, moderatedAt) DO NOTHING
      `;
      materialModCount++;
    }
    console.log(`Inserted ${materialModCount} material moderations`);

    // ===== 8. SEED TARGETS =====
    console.log('Seeding targets...');
    
    const targetIds = [];
    
    // Add some reviews as targets
    for (let i = 0; i < Math.min(5, reviewIds.length); i++) {
      const result = await sql`
        INSERT INTO targets (kind, refID) 
        VALUES ('review', ${reviewIds[i]})
        ON CONFLICT (refID) DO NOTHING
        RETURNING uuid
      `;
      
      if (result && result[0]) {
        targetIds.push(result[0].uuid);
      }
    }
    
    // Add some materials as targets
    for (let i = 0; i < Math.min(3, materialIds.length); i++) {
      const result = await sql`
        INSERT INTO targets (kind, refID) 
        VALUES ('material', ${materialIds[i]})
        ON CONFLICT (refID) DO NOTHING
        RETURNING uuid
      `;
      
      if (result && result[0]) {
        targetIds.push(result[0].uuid);
      }
    }
    console.log(`Inserted ${targetIds.length} targets`);

    // ===== 9. SEED VOTES =====
    console.log('Seeding votes...');
    
    let voteCount = 0;
    
    // Generate votes for targets
    for (const targetId of targetIds) {
      // Each target gets 2-4 votes
      const numVotes = Math.floor(Math.random() * 3) + 2;
      const usedEmails = new Set();
      
      for (let i = 0; i < numVotes; i++) {
        let userIndex;
        do {
          userIndex = Math.floor(Math.random() * users.length);
        } while (usedEmails.has(users[userIndex].email));
        
        usedEmails.add(users[userIndex].email);
        
        const value = Math.random() > 0.3 ? 1 : -1;  // 70% upvotes, 30% downvotes
        
        await sql`
          INSERT INTO votes (uEmail, targetUUID, value, createdAt) 
          VALUES (${users[userIndex].email}, ${targetId}, ${value}, ${getCurrentEpoch()})
          ON CONFLICT (uEmail, targetUUID) DO NOTHING
        `;
        voteCount++;
      }
    }
    console.log(`Inserted ${voteCount} votes`);

    console.log('✅ Database seeding completed successfully!');
    
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    throw error;
  }
}

// Run the seed function
seedDatabase()
  .then(() => {
    console.log('Seeding process finished');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Seeding process failed:', error);
    process.exit(1);
  });