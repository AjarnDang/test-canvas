// Mock PDF data for use across the application
export interface MockPDF {
  key: string;
  title: string;
  filename: string;
  createdAt: string;
  updatedAt: string;
  status: string;
  type: string;
}

// PDF catalog data
export const catalogPDFs: MockPDF[] = [
  { 
    key: "1", 
    title: "price-list", 
    filename: "price-list_2022-03-23.pdf",
    createdAt: "2023-05-01",
    updatedAt: "2023-05-10",
    status: "active",
    type: "catalog"
  },
  {
    key: "2",
    title: "ALL_NEW_CAMRY_2024",
    filename: "ALL_NEW_CAMRY_2024_Catalog.pdf",
    createdAt: "2023-06-01",
    updatedAt: "2023-06-10",
    status: "active",
    type: "catalog"
  },
  { 
    key: "3", 
    title: "atto3-th", 
    filename: "atto3-th.pdf",
    createdAt: "2023-07-01",
    updatedAt: "2023-07-10",
    status: "active",
    type: "catalog"
  },
  {
    key: "4",
    title: "Honda-Accord_Catalogue",
    filename: "Honda-Accord_Catalogue.pdf",
    createdAt: "2023-08-01",
    updatedAt: "2023-08-10",
    status: "active",
    type: "catalog"
  },
  { 
    key: "5", 
    title: "SEALION", 
    filename: "SEALION.pdf",
    createdAt: "2023-09-01",
    updatedAt: "2023-09-10",
    status: "active",
    type: "catalog"
  },
];

// Form PDFs for the table
export const formPDFs: MockPDF[] = [
  {
    key: "1",
    title: "แบบฟอร์มลงทะเบียน",
    filename: "registration_form.pdf",
    createdAt: "2023-05-01",
    updatedAt: "2023-05-10",
    status: "active",
    type: "registration",
  },
  {
    key: "2",
    title: "แบบฟอร์มสมัครงาน",
    filename: "job_application.pdf",
    createdAt: "2023-06-15",
    updatedAt: "2023-06-20",
    status: "active",
    type: "application",
  },
  {
    key: "3",
    title: "แบบสอบถามความพึงพอใจ",
    filename: "satisfaction_survey.pdf",
    createdAt: "2023-07-05",
    updatedAt: "2023-07-12",
    status: "draft",
    type: "survey",
  },
  {
    key: "4",
    title: "แบบฟอร์มเบิกค่าใช้จ่าย",
    filename: "expense_form.pdf",
    createdAt: "2023-08-10",
    updatedAt: "2023-08-15",
    status: "active",
    type: "expense",
  },
  {
    key: "5",
    title: "แบบฟอร์มการลา",
    filename: "leave_form.pdf",
    createdAt: "2023-09-01",
    updatedAt: "2023-09-05",
    status: "inactive",
    type: "leave",
  },
];

// Sample PDFs for generation
export const samplePDFs: MockPDF[] = [
  { 
    key: "1", 
    title: "แบบฟอร์มลงทะเบียน", 
    filename: "registration_form.pdf",
    createdAt: "2023-05-01",
    updatedAt: "2023-05-10",
    status: "active",
    type: "form"
  },
  { 
    key: "2", 
    title: "แบบฟอร์มสมัครงาน", 
    filename: "job_application.pdf",
    createdAt: "2023-06-01",
    updatedAt: "2023-06-10",
    status: "active",
    type: "form"
  },
  { 
    key: "3", 
    title: "แบบสอบถามความพึงพอใจ", 
    filename: "satisfaction_survey.pdf",
    createdAt: "2023-07-01",
    updatedAt: "2023-07-10",
    status: "active",
    type: "form"
  },
  { 
    key: "4", 
    title: "แบบฟอร์มเบิกค่าใช้จ่าย", 
    filename: "expense_form.pdf",
    createdAt: "2023-08-01",
    updatedAt: "2023-08-10",
    status: "active",
    type: "form"
  },
  { 
    key: "5", 
    title: "แบบฟอร์มการลา", 
    filename: "leave_form.pdf",
    createdAt: "2023-09-01",
    updatedAt: "2023-09-10",
    status: "active",
    type: "form"
  },
]; 