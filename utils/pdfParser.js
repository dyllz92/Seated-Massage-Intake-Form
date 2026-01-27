/**
 * PDF Parser - One-time migration script for historical data
 * Run: node utils/pdfParser.js
 */

const pdfParse = require('pdf-parse');
const fs = require('fs');
const path = require('path');

/**
 * Parse a single PDF and extract metadata
 */
async function parsePDF(filePath, filename) {
    try {
        const dataBuffer = fs.readFileSync(filePath);
        const data = await pdfParse(dataBuffer);

        // Extract metadata from filename and text
        const metadata = extractMetadata(data.text, filename);

        return { filename, success: true, metadata };
    } catch (error) {
        console.error(`❌ Error parsing ${filename}:`, error.message);
        return { filename, success: false, error: error.message };
    }
}

/**
 * Extract metadata from PDF text and filename
 */
function extractMetadata(pdfText, filename) {
    // Parse filename format: {ClientName}_{YYYY-MM-DD}_{HHMMSS}_{FormType}.pdf
    const parts = filename.replace('.pdf', '').split('_');
    const dateStr = parts[parts.length - 3]; // YYYY-MM-DD
    const timeStr = parts[parts.length - 2]; // HHMMSS
    const formTypeStr = parts.slice(-1)[0]; // FormType

    // Determine form type from filename
    let formType = 'seated';
    if (formTypeStr.includes('Table')) {
        formType = 'table';
    } else if (formTypeStr.includes('Feedback')) {
        formType = 'feedback';
    }

    // Parse submission date
    const submissionDate = new Date(`${dateStr}T${formatTime(timeStr)}Z`).toISOString();

    // Extract fields using regex
    const metadata = {
        filename,
        submissionDate,
        formType,
        client: {
            fullName: extractField(pdfText, /Full name:?\s*([^\n]+)/i) || 'Unknown',
            mobile: extractField(pdfText, /Mobile:?\s*([^\n]+)/i),
            email: extractField(pdfText, /Email:?\s*([^\n]+)/i),
            gender: extractField(pdfText, /Gender:?\s*([^\n]+)/i)
        },
        ao: {
            role: extractField(pdfText, /Your role at AO:?\s*([^\n]+)/i),
            feelingPre: parseInt(extractField(pdfText, /How are we feeling.*?(\d+)/i)) || null,
            firstTimeAOWellness: extractField(pdfText, /first time.*?(Yes|No)/i),
            therapistName: extractField(pdfText, /Therapist:?\s*([^\n]+)/i) || 'Unknown'
        },
        bodyMap: {
            marksCount: (pdfText.match(/muscleMapMarks|marked area/gi) || []).length
        },
        preferences: {
            pressure: extractField(pdfText, /Pressure.*?:(Light|Medium|Firm)/i)
        },
        tableSpecific: {
            oilPreference: extractField(pdfText, /Oil.*?:(Yes|No|Prefer)/i),
            positionComfort: extractField(pdfText, /Position.*?:(Fine|Trouble)/i)
        },
        health: {
            healthChecks: extractHealthIssues(pdfText),
            hasReviewNote: pdfText.includes('Additional information') || pdfText.includes('Review note'),
            hasAvoidNotes: pdfText.includes('Anything to avoid') || pdfText.includes('Avoid notes')
        },
        marketing: {
            emailOptIn: pdfText.includes('email') && pdfText.includes('opt'),
            smsOptIn: pdfText.includes('SMS') || pdfText.includes('text')
        },
        consent: {
            consentAll: pdfText.includes('consent') || pdfText.includes('agreed')
        },
        feedback: {
            feelingPost: parseInt(extractField(pdfText, /post.*?session.*?(\d+)/i)) || null,
            wouldRecommend: extractField(pdfText, /recommend.*?:(Yes|No)/i),
            hasComments: pdfText.includes('Comment') || pdfText.includes('Feedback')
        }
    };

    return metadata;
}

/**
 * Extract a field from PDF text using regex
 */
function extractField(text, regex) {
    const match = text.match(regex);
    if (match && match[1]) {
        return match[1].trim();
    }
    return null;
}

/**
 * Extract health issues from PDF text
 */
function extractHealthIssues(text) {
    const issues = [];
    const commonIssues = [
        'Pregnant', 'Recent surgery', 'Recent injury', 'Heart condition',
        'Pacemaker', 'Blood clots', 'DVT', 'Blood thinners', 'High blood pressure',
        'Diabetes', 'Skin infection', 'Fever', 'Contagious', 'Allergies',
        'Numbness', 'Tingling', 'Dizziness', 'Fainting', 'Pregnancy'
    ];

    for (const issue of commonIssues) {
        if (text.toLowerCase().includes(issue.toLowerCase())) {
            issues.push(issue);
        }
    }

    return issues;
}

/**
 * Format time string HHMMSS to HH:MM:SS
 */
function formatTime(timeStr) {
    if (timeStr && timeStr.length === 6) {
        return `${timeStr.substring(0, 2)}:${timeStr.substring(2, 4)}:${timeStr.substring(4, 6)}`;
    }
    return '00:00:00';
}

/**
 * Parse all PDFs in the pdfs directory
 */
async function parseHistoricalPDFs() {
    const pdfsDir = path.join(__dirname, '..', 'pdfs');

    if (!fs.existsSync(pdfsDir)) {
        console.log('❌ PDFs directory not found:', pdfsDir);
        return [];
    }

    const files = fs.readdirSync(pdfsDir).filter(f => f.endsWith('.pdf'));

    if (files.length === 0) {
        console.log('ℹ️  No PDF files found in pdfs directory');
        return [];
    }

    console.log(`\n📄 Found ${files.length} PDF file(s) to parse...\n`);

    const results = [];
    const metadataDir = path.join(__dirname, '..', 'metadata');

    // Create metadata directory
    if (!fs.existsSync(metadataDir)) {
        fs.mkdirSync(metadataDir, { recursive: true });
    }

    for (const file of files) {
        process.stdout.write(`Parsing ${file}... `);

        const result = await parsePDF(path.join(pdfsDir, file), file);

        if (result.success) {
            // Save metadata JSON
            const jsonFilename = file.replace('.pdf', '.json');
            const jsonPath = path.join(metadataDir, jsonFilename);

            fs.writeFileSync(jsonPath, JSON.stringify(result.metadata, null, 2));

            console.log('✅');
            results.push({ ...result, status: 'success' });
        } else {
            console.log(`❌ ${result.error}`);
            results.push(result);
        }
    }

    return results;
}

/**
 * Main execution
 */
async function main() {
    console.log('\n🔄 Historical PDF Migration Script');
    console.log('==================================\n');

    try {
        const results = await parseHistoricalPDFs();

        // Summary
        const successful = results.filter(r => r.success).length;
        const failed = results.filter(r => !r.success).length;

        console.log(`\n📊 Migration Summary`);
        console.log(`===================`);
        console.log(`✅ Successfully parsed: ${successful}`);
        console.log(`❌ Failed: ${failed}`);
        console.log(`📁 Metadata saved to: ./metadata/\n`);

        if (failed > 0) {
            console.log('⚠️  Some files failed to parse. Check the errors above.\n');
        } else if (successful > 0) {
            console.log('🎉 All files successfully migrated!\n');
        } else {
            console.log('ℹ️  No files to migrate.\n');
        }

        process.exit(successful > 0 ? 0 : 1);
    } catch (error) {
        console.error('\n❌ Migration failed:', error.message);
        console.error(error);
        process.exit(1);
    }
}

// Run if called directly
if (require.main === module) {
    main();
}

module.exports = { parseHistoricalPDFs, parsePDF, extractMetadata };
