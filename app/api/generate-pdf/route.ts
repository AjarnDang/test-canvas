import { NextResponse } from 'next/server';
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';
import fs from 'fs';
import path from 'path';
import { samplePDFs } from '../../data/mockPDFs';

export async function GET(request: Request) {
  try {
    await generateSamplePDFs();
    return NextResponse.json({ message: 'Sample PDFs generated successfully' });
  } catch (error) {
    console.error('Error generating PDFs:', error);
    return NextResponse.json({ error: 'Failed to generate PDFs' }, { status: 500 });
  }
}

// ฟังก์ชันสร้าง PDF ตัวอย่าง
async function generateSamplePDFs() {
  const pdfOutputDir = path.join(process.cwd(), 'public', 'pdfs');
  
  // ตรวจสอบว่าโฟลเดอร์มีอยู่หรือไม่
  if (!fs.existsSync(pdfOutputDir)) {
    fs.mkdirSync(pdfOutputDir, { recursive: true });
  }
  
  // สร้าง PDF ตัวอย่างสำหรับแต่ละประเภท
  await createRegistrationForm(pdfOutputDir, samplePDFs[0].filename);
  await createJobApplicationForm(pdfOutputDir, samplePDFs[1].filename);
  await createSatisfactionSurvey(pdfOutputDir, samplePDFs[2].filename);
  await createExpenseForm(pdfOutputDir, samplePDFs[3].filename);
  await createLeaveForm(pdfOutputDir, samplePDFs[4].filename);
}

async function createRegistrationForm(outputDir: string, filename: string) {
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([595, 842]); // A4 size
  
  // ดึงฟอนต์มาตรฐาน
  const helveticaFont = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const helveticaBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  
  // เพิ่มหัวข้อ
  page.drawText('แบบฟอร์มลงทะเบียน', {
    x: 50,
    y: 800,
    size: 24,
    font: helveticaBold,
    color: rgb(0, 0, 0.7),
  });
  
  // เพิ่มเนื้อหา
  page.drawText('ชื่อ-นามสกุล:', {
    x: 50,
    y: 750,
    size: 12,
    font: helveticaFont,
  });
  
  page.drawText('อีเมล:', {
    x: 50,
    y: 700,
    size: 12,
    font: helveticaFont,
  });
  
  page.drawText('เบอร์โทรศัพท์:', {
    x: 50,
    y: 650,
    size: 12,
    font: helveticaFont,
  });
  
  page.drawText('ที่อยู่:', {
    x: 50,
    y: 600,
    size: 12,
    font: helveticaFont,
  });
  
  // บันทึกไฟล์
  const pdfBytes = await pdfDoc.save();
  fs.writeFileSync(path.join(outputDir, filename), pdfBytes);
}

async function createJobApplicationForm(outputDir: string, filename: string) {
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([595, 842]);
  
  const helveticaFont = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const helveticaBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  
  page.drawText('แบบฟอร์มสมัครงาน', {
    x: 50,
    y: 800,
    size: 24,
    font: helveticaBold,
    color: rgb(0, 0, 0.7),
  });
  
  page.drawText('ชื่อผู้สมัคร:', {
    x: 50,
    y: 750,
    size: 12,
    font: helveticaFont,
  });
  
  page.drawText('ตำแหน่งที่สมัคร:', {
    x: 50,
    y: 700,
    size: 12,
    font: helveticaFont,
  });
  
  page.drawText('เงินเดือนที่ต้องการ:', {
    x: 50,
    y: 650,
    size: 12,
    font: helveticaFont,
  });
  
  page.drawText('ประสบการณ์ทำงาน:', {
    x: 50,
    y: 600,
    size: 12,
    font: helveticaFont,
  });
  
  const pdfBytes = await pdfDoc.save();
  fs.writeFileSync(path.join(outputDir, filename), pdfBytes);
}

async function createSatisfactionSurvey(outputDir: string, filename: string) {
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([595, 842]);
  
  const helveticaFont = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const helveticaBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  
  page.drawText('แบบสอบถามความพึงพอใจ', {
    x: 50,
    y: 800,
    size: 24,
    font: helveticaBold,
    color: rgb(0, 0, 0.7),
  });
  
  page.drawText('ชื่อผู้ตอบแบบสอบถาม:', {
    x: 50,
    y: 750,
    size: 12,
    font: helveticaFont,
  });
  
  page.drawText('ระดับความพึงพอใจ:', {
    x: 50,
    y: 700,
    size: 12,
    font: helveticaFont,
  });
  
  page.drawText('ข้อเสนอแนะ:', {
    x: 50,
    y: 650,
    size: 12,
    font: helveticaFont,
  });
  
  const pdfBytes = await pdfDoc.save();
  fs.writeFileSync(path.join(outputDir, filename), pdfBytes);
}

async function createExpenseForm(outputDir: string, filename: string) {
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([595, 842]);
  
  const helveticaFont = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const helveticaBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  
  page.drawText('แบบฟอร์มเบิกค่าใช้จ่าย', {
    x: 50,
    y: 800,
    size: 24,
    font: helveticaBold,
    color: rgb(0, 0, 0.7),
  });
  
  page.drawText('ชื่อผู้เบิก:', {
    x: 50,
    y: 750,
    size: 12,
    font: helveticaFont,
  });
  
  page.drawText('จำนวนเงิน:', {
    x: 50,
    y: 700,
    size: 12,
    font: helveticaFont,
  });
  
  page.drawText('รายละเอียด:', {
    x: 50,
    y: 650,
    size: 12,
    font: helveticaFont,
  });
  
  const pdfBytes = await pdfDoc.save();
  fs.writeFileSync(path.join(outputDir, filename), pdfBytes);
}

async function createLeaveForm(outputDir: string, filename: string) {
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([595, 842]);
  
  const helveticaFont = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const helveticaBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  
  page.drawText('แบบฟอร์มการลา', {
    x: 50,
    y: 800,
    size: 24,
    font: helveticaBold,
    color: rgb(0, 0, 0.7),
  });
  
  page.drawText('ชื่อผู้ลา:', {
    x: 50,
    y: 750,
    size: 12,
    font: helveticaFont,
  });
  
  page.drawText('แผนก:', {
    x: 50,
    y: 700,
    size: 12,
    font: helveticaFont,
  });
  
  page.drawText('ประเภทการลา:', {
    x: 50,
    y: 650,
    size: 12,
    font: helveticaFont,
  });
  
  page.drawText('เหตุผลการลา:', {
    x: 50,
    y: 600,
    size: 12,
    font: helveticaFont,
  });
  
  const pdfBytes = await pdfDoc.save();
  fs.writeFileSync(path.join(outputDir, filename), pdfBytes);
} 