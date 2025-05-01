import { NextResponse } from 'next/server';
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';
import fs from 'fs';
import path from 'path';
import { catalogPDFs } from '../../data/mockPDFs';

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
  
  // สร้าง PDF ตัวอย่างตามแคตตาล็อก
  await createPriceListPDF(pdfOutputDir, catalogPDFs[0].filename);
  await createCarCatalogPDF(pdfOutputDir, catalogPDFs[1].filename, "Toyota All New Camry 2024");
  await createCarCatalogPDF(pdfOutputDir, catalogPDFs[2].filename, "BYD Atto 3");
  await createCarCatalogPDF(pdfOutputDir, catalogPDFs[3].filename, "Honda Accord");
  await createCarCatalogPDF(pdfOutputDir, catalogPDFs[4].filename, "BYD Seal Lion");
}

async function createPriceListPDF(outputDir: string, filename: string) {
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([595, 842]); // A4 size
  
  // ดึงฟอนต์มาตรฐาน
  const helveticaFont = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const helveticaBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  
  // เพิ่มหัวข้อ
  page.drawText('รายการสินค้าและราคา', {
    x: 50,
    y: 800,
    size: 24,
    font: helveticaBold,
    color: rgb(0, 0, 0.7),
  });
  
  // เพิ่มเนื้อหา
  page.drawText('รหัสสินค้า:', {
    x: 50,
    y: 750,
    size: 12,
    font: helveticaFont,
  });
  
  page.drawText('ชื่อสินค้า:', {
    x: 50,
    y: 700,
    size: 12,
    font: helveticaFont,
  });
  
  page.drawText('ราคา:', {
    x: 50,
    y: 650,
    size: 12,
    font: helveticaFont,
  });
  
  page.drawText('จำนวน:', {
    x: 50,
    y: 600,
    size: 12,
    font: helveticaFont,
  });
  
  // บันทึกไฟล์
  const pdfBytes = await pdfDoc.save();
  fs.writeFileSync(path.join(outputDir, filename), pdfBytes);
}

async function createCarCatalogPDF(outputDir: string, filename: string, carModel: string) {
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([595, 842]);
  
  const helveticaFont = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const helveticaBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  
  page.drawText(`แคตตาล็อก ${carModel}`, {
    x: 50,
    y: 800,
    size: 24,
    font: helveticaBold,
    color: rgb(0, 0, 0.7),
  });
  
  page.drawText('รุ่นรถ:', {
    x: 50,
    y: 750,
    size: 12,
    font: helveticaFont,
  });
  
  page.drawText('สี:', {
    x: 50,
    y: 700,
    size: 12,
    font: helveticaFont,
  });
  
  page.drawText('ขนาดเครื่องยนต์:', {
    x: 50,
    y: 650,
    size: 12,
    font: helveticaFont,
  });
  
  page.drawText('ราคา:', {
    x: 50,
    y: 600,
    size: 12,
    font: helveticaFont,
  });
  
  const pdfBytes = await pdfDoc.save();
  fs.writeFileSync(path.join(outputDir, filename), pdfBytes);
} 