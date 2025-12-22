/**
 * Seed script to populate the database with images stored as base64
 * Run this once to add your existing images to MongoDB
 * 
 * Usage: node seed.js
 */

require('dotenv').config();
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const Image = require('./models/Image');

// Helper function to read image and convert to base64 data URL
const imageToBase64 = (filePath) => {
    try {
        const absolutePath = path.join(__dirname, 'uploads', filePath);
        if (!fs.existsSync(absolutePath)) {
            console.warn(`Warning: File not found: ${absolutePath}`);
            return null;
        }
        const fileBuffer = fs.readFileSync(absolutePath);
        const ext = path.extname(filePath).toLowerCase();
        const mimeType = ext === '.png' ? 'image/png' :
            ext === '.gif' ? 'image/gif' :
                ext === '.webp' ? 'image/webp' : 'image/jpeg';
        const base64 = fileBuffer.toString('base64');
        return { imageData: `data:${mimeType};base64,${base64}`, mimeType };
    } catch (error) {
        console.error(`Error reading file ${filePath}:`, error.message);
        return null;
    }
};

// Babiii images - filenames in uploads/babiii/
const babiiiFiles = [
    { filename: '2025-02-27 Babii and her balloon', date: new Date('2025-02-27'), description: 'Babii and her balloon', file: 'babiii/2025-02-27 Babii and her balloon.jpg' },
    { filename: '2025-03-15 Kandy Visit', date: new Date('2025-03-15'), description: 'Kandy Visit... Nope Babi isn\'t naked here', file: 'babiii/2025-03-15 Kandy Visit... Nope Babi isn\'t naked here.jpg' },
    { filename: '2025-03-25 Sadunis Farewell', date: new Date('2025-03-25'), description: 'Sadunis\' Farewell I love the top', file: 'babiii/2025-03-25 Sadunis\' Farewell I love the top.jpg' },
    { filename: '2025-04-05 Fit check', date: new Date('2025-04-05'), description: 'Fit check passed with flying colors', file: 'babiii/2025-04-05 Fit check passed with flying colors.jpg' },
    { filename: '2025-04-06 Meltz', date: new Date('2025-04-06'), description: 'Mmmm Meltzzzz', file: 'babiii/2025-04-06 Mmmm Meltzzzz.jpg' },
    { filename: '2025-04-16 Phone Hijack', date: new Date('2025-04-16'), description: 'Babi Hijacked My phone', file: 'babiii/2025-04-16 Babi Hijacked My phone.jpg' },
    { filename: '2025-04-16 MC Visit', date: new Date('2025-04-16'), description: 'Visited MC after an apocolypse', file: 'babiii/2025-04-16 Visited MC after an apocolypse.jpg' },
    { filename: '2025-04-17 Zomato', date: new Date('2025-04-17'), description: 'Zomato and Kitchen Renovation', file: 'babiii/2025-04-17 Zomato and Kitchen Renovation.jpg' },
    { filename: '2025-04-21 Cute', date: new Date('2025-04-21'), description: 'Cuteeeeee', file: 'babiii/2025-04-21 Cuteeeeee.jpg' },
    { filename: '2025-04-25 Hehe', date: new Date('2025-04-25'), description: 'Hehe', file: 'babiii/2025-04-25 Hehe.jpg' },
    { filename: '2025-04-25 Smash Burger', date: new Date('2025-04-25'), description: 'Mss.Muncheeesss at Smash Burgar', file: 'babiii/2025-04-25 Mss.Muncheeesss at Smash Burgar.jpg' },
    { filename: '2025-04-25 Munchees 2', date: new Date('2025-04-25'), description: 'Munchesss 2', file: 'babiii/2025-04-25 Munchesss 2.jpg' },
    { filename: '2025-04-26 SLIIT Library', date: new Date('2025-04-26'), description: 'Supermodel at SLIIT library', file: 'babiii/2025-04-26 Supermodel at SLIIT library.jpg' },
    { filename: '2025-04-29 Mirror Selfie', date: new Date('2025-04-29'), description: 'Not me assisting the mirror selfie', file: 'babiii/2025-04-29 Not me assisting the mirror selfie.jpg' },
    { filename: '2025-04-29 Uptown', date: new Date('2025-04-29'), description: 'Supermodel at Uptown', file: 'babiii/2025-04-29 Supermodel at Uptown.jpg' },
    { filename: '2025-04-30 Aurudu Kumariya', date: new Date('2025-04-30'), description: 'My aurudu Kumariya', file: 'babiii/2025-04-30 My aurudu Kumariya.jpg' },
    { filename: '2025-05-02 Shooting', date: new Date('2025-05-02'), description: 'Shooting in action', file: 'babiii/2025-05-02 Shooting in action.jpg' },
    { filename: '2025-05-02 Can Shoot', date: new Date('2025-05-02'), description: 'Yep babi can shoottt', file: 'babiii/2025-05-02 Yep babi can shoottt.jpg' },
    { filename: '2025-05-03 SLIIT Library 2', date: new Date('2025-05-03'), description: 'Supermodel at SLIIT library Part 2', file: 'babiii/2025-05-03 Supermodel at SLIIT libraby Part 2.jpg' },
    { filename: '2025-05-07 Hand Model', date: new Date('2025-05-07'), description: 'who is this handmodel', file: 'babiii/2025-05-07 who is this handmodel.jpg' },
    { filename: '2025-05-09 Pan Pan', date: new Date('2025-05-09'), description: 'Pan Pan and Paris boobs', file: 'babiii/2025-05-09 Pan Pan and Paris boobs.jpg' },
    { filename: 'Chuti babii Pinnawala', date: null, description: 'Chuti babii atg Pinnawala ig', file: 'babiii/Chuti babii atg Pinnawala ig.jpg' },
    { filename: 'Chuti babii family', date: null, description: 'Chuti babii with ammi and thaththi', file: 'babiii/Chuti babii with ammi and thaththi.jpg' },
    { filename: 'Chuti babii swing', date: null, description: 'Chutii babi and the swing', file: 'babiii/Chutii babi and the swing.jpg' },
    { filename: 'Chutii babii 2', date: null, description: 'Chutii babiii 2', file: 'babiii/Chutii babiii 2.jpg' },
    { filename: 'Chutii babiii', date: null, description: 'Chutii babiii', file: 'babiii/Chutii babiii.jpg' },
    { filename: 'Chuti chuti babii', date: null, description: 'Chutii chutii babii', file: 'babiii/Chutii chutii babii.jpg' },
    { filename: 'Chutii taffy', date: null, description: 'Chutii taffyyy', file: 'babiii/Chutii taffyyy.jpg' },
    { filename: 'Love These', date: null, description: 'I loveee theseeee', file: 'babiii/I loveee theseeee.jpg' },
    { filename: 'Love These 2', date: null, description: 'I loveee theseeee part 2', file: 'babiii/I loveee theseeee part 2.jpg' },
    { filename: 'Supermodel', date: null, description: 'Omg Who is this super model', file: 'babiii/Omg Who is this super model.jpg' },
    { filename: 'Golfer', date: null, description: 'oooh she\'s a golfer', file: 'babiii/oooh she\'s a golfer.jpg' },
];

// Moments images - filenames in uploads/moments/
const momentsFiles = [
    { filename: '2025-02-22 First date', date: new Date('2025-02-22'), description: 'First date', file: 'moments/2025-02-22 First date.jpg' },
    { filename: '2025-03-05 Office moments', date: new Date('2025-03-05'), description: 'After office moments (this was taken by Navodya btw)', file: 'moments/2025-03-05 After office moments (this was taken by Navodya btw).jpg' },
    { filename: '2025-03-15 Bag', date: new Date('2025-03-15'), description: 'Me Slaying Babiiis bag', file: 'moments/2025-03-15 Me Slaying Babiiis bag.jpg' },
    { filename: '2025-04-06 Suncrush', date: new Date('2025-04-06'), description: 'Had Suncrush without seeing', file: 'moments/2025-04-06 Had Suncrush without seeing.jpg' },
    { filename: '2025-04-06 Snapchat', date: new Date('2025-04-06'), description: 'Testing snapchat filters', file: 'moments/2025-04-06 Testing snapchat filters.jpg' },
    { filename: '2025-04-17 Favorite', date: new Date('2025-04-17'), description: 'Babi loves this picture', file: 'moments/2025-04-17 Babi loves this picture .jpg' },
    { filename: '2025-04-17 BK Visit', date: new Date('2025-04-17'), description: 'Babi visited BK after inflation and Met Ammi', file: 'moments/2025-04-17 Babi visited BK after inflation and Met Ammi.jpg' },
    { filename: '2025-04-17 Shorts', date: new Date('2025-04-17'), description: 'Yepp... Babi bought this shorts from Gflock Bamba', file: 'moments/2025-04-17 Yepp... Babi bought this shorts from Gflock Bamba.jpg' },
    { filename: '2025-04-22 Selfies', date: new Date('2025-04-22'), description: 'Random office selfiesss', file: 'moments/2025-04-22 Random office selfiesss.jpg' },
    { filename: '2025-04-25 Train', date: new Date('2025-04-25'), description: '1st train ride together', file: 'moments/2025-04-25 1st train ride together.jpg' },
    { filename: '2025-04-25 DHL', date: new Date('2025-04-25'), description: 'DHL Visit Yep... We sang songs loudddd', file: 'moments/2025-04-25 DHL Visit Yep... We sang songs loudddd.jpg' },
    { filename: '2025-04-26 Jagro', date: new Date('2025-04-26'), description: 'Desserts at Jagrooo', file: 'moments/2025-04-26 Desserts at Jagrooo.jpg' },
    { filename: '2025-04-27 Beach', date: new Date('2025-04-27'), description: 'Mount beach... What happened to the trash can...', file: 'moments/2025-04-27 Mount beach... What happened to the trash can...jpg' },
    { filename: '2025-04-29 Model', date: new Date('2025-04-29'), description: 'Model Location', file: 'moments/2025-04-29 Model Location.jpg' },
    { filename: '2025-04-30 Aurudu', date: new Date('2025-04-30'), description: '1st Proper picture together at sliit aurudu', file: 'moments/2025-04-30 1st Proper picture together at sliit aurudu.jpg' },
    { filename: '2025-04-30 OGF', date: new Date('2025-04-30'), description: 'After Aurudu Shoppings at OGF', file: 'moments/2025-04-30 After Aurudu Shoppings at OGF.jpg' },
    { filename: '2025-05-02 Swimming', date: new Date('2025-05-02'), description: 'oooh the dayout Swming session was litttt', file: 'moments/2025-05-02 oooh the dayout Swming session was litttt.jpg' },
    { filename: '2025-05-02 Background', date: new Date('2025-05-02'), description: 'Nice Background', file: 'moments/2025-05-02 Nice Background.jpg' },
    { filename: '2025-05-02 Manhattan', date: new Date('2025-05-02'), description: 'Manhatten fish Market is overrated', file: 'moments/2025-05-02 Manhatten fish Market is overrated.jpg' },
    { filename: '2025-05-04 Influencer', date: new Date('2025-05-04'), description: 'Babi is an influencer', file: 'moments/2025-05-04 Babi is an influencer.jpg' },
    { filename: '2025-05-10 Flowers', date: new Date('2025-05-10'), description: 'Me got flowers for the 1st time forever gratefull for that moment', file: 'moments/2025-05-10 Me got flowers for the 1st time forever gratefull for that moment.jpg' },
];

// Letter image
const letterFile = {
    filename: 'Love Letter',
    date: null,
    description: 'A special letter from me to you',
    file: 'letter/letter2.jpg'
};

async function seedDatabase() {
    try {
        console.log('Connecting to MongoDB...');
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB!');

        // Clear existing images
        console.log('Clearing existing images...');
        await Image.deleteMany({});

        // Process and insert Babiii images
        console.log('\nProcessing Babiii images...');
        let babiiiCount = 0;
        for (const item of babiiiFiles) {
            const imageData = imageToBase64(item.file);
            if (imageData) {
                await Image.create({
                    filename: item.filename,
                    description: item.description,
                    date: item.date,
                    category: 'babiii',
                    imageData: imageData.imageData,
                    mimeType: imageData.mimeType
                });
                babiiiCount++;
                process.stdout.write(`\rInserted ${babiiiCount}/${babiiiFiles.length} Babiii images`);
            }
        }
        console.log(`\n✓ Inserted ${babiiiCount} Babiii images`);

        // Process and insert Moments images
        console.log('\nProcessing Moments images...');
        let momentsCount = 0;
        for (const item of momentsFiles) {
            const imageData = imageToBase64(item.file);
            if (imageData) {
                await Image.create({
                    filename: item.filename,
                    description: item.description,
                    date: item.date,
                    category: 'moments',
                    imageData: imageData.imageData,
                    mimeType: imageData.mimeType
                });
                momentsCount++;
                process.stdout.write(`\rInserted ${momentsCount}/${momentsFiles.length} Moments images`);
            }
        }
        console.log(`\n✓ Inserted ${momentsCount} Moments images`);

        // Process and insert Letter image
        console.log('\nProcessing Letter image...');
        const letterData = imageToBase64(letterFile.file);
        if (letterData) {
            await Image.create({
                filename: letterFile.filename,
                description: letterFile.description,
                date: letterFile.date,
                category: 'letter',
                imageData: letterData.imageData,
                mimeType: letterData.mimeType
            });
            console.log('✓ Inserted Letter image');
        }

        console.log('\n✅ Database seeded successfully!');
        console.log(`Total images: ${babiiiCount + momentsCount + 1}`);

    } catch (error) {
        console.error('Error seeding database:', error);
    } finally {
        await mongoose.connection.close();
        console.log('Database connection closed.');
        process.exit(0);
    }
}

// Run if called directly
if (require.main === module) {
    seedDatabase();
}

module.exports = { seedDatabase };
