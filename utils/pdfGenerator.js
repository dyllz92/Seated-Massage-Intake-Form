const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

/**
 * Generate a PDF from form data
 * @param {Object} formData - The form submission data
 * @returns {Promise<Buffer>} PDF buffer
 */
async function generatePDF(formData) {
    return new Promise((resolve, reject) => {
        try {
            const doc = new PDFDocument({ 
                size: 'A4', 
                margins: { top: 50, bottom: 50, left: 50, right: 50 } 
            });
            
            const chunks = [];
            
            doc.on('data', chunk => chunks.push(chunk));
            doc.on('end', () => resolve(Buffer.concat(chunks)));
            doc.on('error', reject);
            
            // Header
            doc.fontSize(20)
               .fillColor('#2c5f7d')
               .text('Flexion & Flow', { align: 'center' });
            
            doc.fontSize(16)
               .text('Seated Chair Massage Intake Form', { align: 'center' });
            
                doc.fontSize(10)
                    .fillColor('#666')
                    .text('Universal Seated Chair Massage Intake', { align: 'center' });
            
            doc.moveDown(1);
            doc.strokeColor('#2c5f7d')
               .lineWidth(2)
               .moveTo(50, doc.y)
               .lineTo(545, doc.y)
               .stroke();
            
            doc.moveDown(1);
            
            // Submission info
            doc.fontSize(9)
               .fillColor('#666')
               .text(`Submitted: ${new Date(formData.submissionDate).toLocaleString()}`, { align: 'right' });
            
            doc.moveDown(1);
            
            // Generate appropriate form based on type
            generateUniversalForm(doc, formData);
            
            // Signature section
            doc.moveDown(1.5);
            doc.fontSize(12)
               .fillColor('#000')
               .text('Signature:', { continued: false });
            
            doc.moveDown(0.5);
            
            if (formData.signature) {
                try {
                    const signatureData = formData.signature.replace(/^data:image\/\w+;base64,/, '');
                    const signatureBuffer = Buffer.from(signatureData, 'base64');
                    doc.image(signatureBuffer, {
                        fit: [200, 50],
                        align: 'left'
                    });
                } catch (error) {
                    console.error('Error adding signature to PDF:', error);
                    doc.fontSize(10).text('[Signature image error]');
                }
            }
            
            doc.moveDown(0.5);
                const signedTs = formData.signedAt ? new Date(formData.signedAt).toLocaleString() : (formData.signatureDate || new Date(formData.submissionDate).toLocaleDateString());
                doc.fontSize(9)
                    .fillColor('#666')
                    .text(`Signed: ${signedTs}`);
            
            // Footer
            doc.fontSize(8)
               .fillColor('#999')
               .text('This document contains confidential health information and should be stored securely.', 
                     50, doc.page.height - 70, 
                     { align: 'center', width: 495 });
            
            doc.end();
            
        } catch (error) {
            reject(error);
        }
    });
}

function generateUniversalForm(doc, data) {
    doc.fillColor('#000');

    addSection(doc, 'Client Details');
    addField(doc, 'Full name', data.fullName);
    addField(doc, 'Mobile', data.mobile);
    addField(doc, 'Email', data.email || 'Not provided');

    addSection(doc, 'Body Map');
    if (data.muscleMapMarks) {
        try {
            const marks = typeof data.muscleMapMarks === 'string' ? JSON.parse(data.muscleMapMarks) : data.muscleMapMarks;
            addField(doc, 'Discomfort areas marked', Array.isArray(marks) && marks.length > 0 ? `${marks.length} area(s) marked on body map` : 'None');
        } catch (e) {
            addField(doc, 'Discomfort areas marked', 'Parse error');
        }
    } else {
        addField(doc, 'Discomfort areas marked', 'None');
    }

    addSection(doc, "Preferences");
    addField(doc, 'Pressure preference', data.pressurePreference || 'Not specified');

    addSection(doc, 'Quick Health Check');
    addField(doc, 'Items flagged', Array.isArray(data.healthChecks) ? data.healthChecks.join(', ') : (data.healthChecks || 'None'));
    if (data.reviewedByTherapist) {
        addField(doc, 'Reviewed by therapist', 'Yes');
        if (data.reviewNote) addField(doc, 'Review note', data.reviewNote);
    }

    if (data.avoidNotes) {
        addSection(doc, 'Anything to avoid');
        addField(doc, 'Avoid', data.avoidNotes);
    }

    addSection(doc, 'Consent');
    addField(doc, 'Terms accepted', data.termsAccepted ? 'Yes' : 'No');
    addField(doc, 'Treatment consent', data.treatmentConsent ? 'Yes' : 'No');
    if (typeof data.publicSettingOk !== 'undefined') {
        addField(doc, 'Public setting acknowledgement', data.publicSettingOk ? 'Yes' : 'No');
    }
    if (data.signedAt) addField(doc, 'Signed at', data.signedAt);
    addField(doc, 'Status', data.status || 'submitted');
}

function addSection(doc, title) {
    doc.moveDown(1);
    doc.fontSize(12)
       .fillColor('#2c5f7d')
       .text(title, { underline: true });
    doc.moveDown(0.5);
}

function addField(doc, label, value) {
    if (doc.y > 700) {
        doc.addPage();
    }
    
    doc.fontSize(10)
       .fillColor('#333')
       .text(label + ': ', { continued: true })
       .fillColor('#000')
       .text(value || 'Not provided');
    
    doc.moveDown(0.3);
}

function formatValue(value, otherValue) {
    if (!value) return 'Not provided';
    if (value === 'Other' && otherValue) {
        return `Other: ${otherValue}`;
    }
    return value;
}

function formatArrayValue(arr, otherValue) {
    if (!arr) return 'None';
    
    const values = Array.isArray(arr) ? arr : [arr];
    let result = values.filter(v => v && v !== 'Other').join(', ');
    
    if (values.includes('Other') && otherValue) {
        result += (result ? ', ' : '') + `Other: ${otherValue}`;
    }
    
    return result || 'None';
}

module.exports = {
    generatePDF
};
