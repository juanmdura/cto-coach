const { PrismaClient } = require('@prisma/client');
const fs = require('fs/promises');
const path = require('path');

const prisma = new PrismaClient();

async function addSampleDocuments() {
  try {
    console.log('🚀 Adding sample documents to the database...');

    const sampleDocs = [
      {
        file: '../sample-docs/software-architecture-principles.md',
        title: 'Software Architecture Principles',
        fileType: 'text/markdown'
      },
      {
        file: '../sample-docs/engineering-leadership-guide.md',
        title: 'Engineering Leadership Guide',
        fileType: 'text/markdown'
      },
      {
        file: '../sample-docs/code-review-best-practices.md',
        title: 'Code Review Best Practices',
        fileType: 'text/markdown'
      }
    ];

    for (const doc of sampleDocs) {
      const filePath = path.join(__dirname, doc.file);
      const content = await fs.readFile(filePath, 'utf-8');

      // Check if document already exists
      const existingDoc = await prisma.document.findFirst({
        where: { title: doc.title }
      });

      if (existingDoc) {
        console.log(`📄 "${doc.title}" already exists, skipping...`);
        continue;
      }

      await prisma.document.create({
        data: {
          title: doc.title,
          content: content,
          fileType: doc.fileType,
          sourceUrl: null,
          filePath: null
        }
      });

      console.log(`✅ Added "${doc.title}"`);
    }

    console.log('🎉 Sample documents added successfully!');
    
    // Show total document count
    const totalDocs = await prisma.document.count();
    console.log(`📊 Total documents in database: ${totalDocs}`);

  } catch (error) {
    console.error('❌ Error adding sample documents:', error);
  } finally {
    await prisma.$disconnect();
  }
}

addSampleDocuments();
