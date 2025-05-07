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
  {
    key: "6",
    title: "3_Series_Brochure_REV04_LR.pdf.asset.1668171941574",
    filename: "3_Series_Brochure_REV04_LR.pdf.asset.1668171941574.pdf",
    createdAt: "2023-10-01",
    updatedAt: "2023-10-10",
    status: "active",
    type: "catalog"
  },
  {
    key: "7",
    title: "M0052_2558",
    filename: "M0052_2558.pdf",
    createdAt: "2023-11-01",
    updatedAt: "2023-11-10",
    status: "active",
    type: "catalog"
  },
];