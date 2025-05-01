"use client";

import React, { useState } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import { Layout, Button, Input, Spin, Alert, Select, Tooltip } from "antd";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ZoomInOutlined,
  ZoomOutOutlined,
  LeftOutlined,
  RightOutlined,
  DownloadOutlined,
  EditOutlined,
  HomeOutlined,
} from "@ant-design/icons";
import { catalogPDFs } from "../data/mockPDFs";

// ตั้งค่า worker ของ PDF.js
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

const { Header, Content, Footer } = Layout;

// รายการ PDF ที่จำลองขึ้นมา
const mockPDFs = catalogPDFs;

const PDFViewer: React.FC = () => {
  const [numPages, setNumPages] = useState<number | null>(null);
  const [pageNumber, setPageNumber] = useState<number>(1);
  const [scale, setScale] = useState<number>(1.0);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const searchParams = useSearchParams();
  const router = useRouter();
  const id = searchParams.get("id");

  // ค้นหา PDF ที่ต้องการแสดง
  const selectedPDF = id ? mockPDFs.find((pdf) => pdf.key === id) : null;
  const pdfUrl = selectedPDF ? `/pdfs/${selectedPDF.filename}` : null;

  function onDocumentLoadSuccess({ numPages }: { numPages: number }): void {
    setNumPages(numPages);
    setPageNumber(1);
    setIsLoading(false);
  }

  function onDocumentLoadError(error: Error): void {
    setError(`ไม่สามารถโหลดเอกสารได้: ${error.message}`);
    setIsLoading(false);
  }

  function changePage(offset: number) {
    setPageNumber((prevPageNumber) => {
      const newPageNumber = prevPageNumber + offset;
      return Math.min(Math.max(1, newPageNumber), numPages || 1);
    });
  }

  function previousPage() {
    changePage(-1);
  }

  function nextPage() {
    changePage(1);
  }

  function zoomIn() {
    setScale((prevScale) => Math.min(prevScale + 0.2, 3.0));
  }

  function zoomOut() {
    setScale((prevScale) => Math.max(prevScale - 0.2, 0.5));
  }

  function handlePDFChange(newId: string) {
    router.push(`/pdf-viewer?id=${newId}`);
  }

  // สร้าง placeholder PDF สำหรับตัวอย่าง
  const renderPlaceholderPDF = () => (
    <div className="flex items-center justify-center h-[500px] w-full bg-gray-100 border border-gray-300 rounded-lg">
      <div className="text-center">
        <div className="text-6xl text-gray-400 mb-4">PDF</div>
        <p className="text-gray-500">กรุณาเลือก PDF จากรายการ</p>
      </div>
    </div>
  );

  return (
    <Layout className="min-h-screen">
      <Header
        style={{
          position: "sticky",
          top: 0,
          zIndex: 999,
          width: "100%",
          display: "flex",
          alignItems: "center",
        }}
      >
        <div className="text-white text-xl font-bold mr-6">
          PDF Form Builder
        </div>
        <div className="flex-1">
          <Link href="/">
            <Button type="primary" icon={<HomeOutlined />} className="mr-2">
              หน้าหลัก
            </Button>
          </Link>
          {selectedPDF && (
            <Link href={`/form-builder?id=${selectedPDF.key}`}>
              <Button type="default" icon={<EditOutlined />}>
                แก้ไขฟอร์ม
              </Button>
            </Link>
          )}
        </div>
      </Header>

      <Content className="p-6">
        <div className="mb-6 bg-white p-6 rounded-lg shadow-sm">
          <div className="flex flex-wrap items-center justify-between mb-4">
            <div className="flex items-center mb-2 sm:mb-0">
              <h1 className="text-2xl font-bold mr-4">
                {selectedPDF ? selectedPDF.title : "PDF Viewer"}
              </h1>
              <Select
                placeholder="เลือก PDF"
                className="w-64"
                value={id || undefined}
                onChange={handlePDFChange}
                options={mockPDFs.map((pdf) => ({
                  value: pdf.key,
                  label: pdf.title,
                }))}
              />
            </div>

            <div className="flex items-center">
              <Tooltip title="ซูมออก">
                <Button
                  icon={<ZoomOutOutlined />}
                  onClick={zoomOut}
                  className="mr-2"
                />
              </Tooltip>
              <div className="mx-2">{Math.round(scale * 100)}%</div>
              <Tooltip title="ซูมเข้า">
                <Button
                  icon={<ZoomInOutlined />}
                  onClick={zoomIn}
                  className="ml-2 mr-4"
                />
              </Tooltip>

              {numPages && (
                <div className="flex items-center">
                  <Tooltip title="หน้าก่อนหน้า">
                    <Button
                      icon={<LeftOutlined />}
                      onClick={previousPage}
                      disabled={pageNumber <= 1}
                      className="mr-2"
                    />
                  </Tooltip>
                  <span>
                    <Input
                      type="number"
                      min={1}
                      max={numPages}
                      value={pageNumber}
                      onChange={(e) =>
                        setPageNumber(parseInt(e.target.value) || 1)
                      }
                      style={{ width: 60 }}
                      className="text-center"
                    />
                    <span className="mx-1">จาก {numPages}</span>
                  </span>
                  <Tooltip title="หน้าถัดไป">
                    <Button
                      icon={<RightOutlined />}
                      onClick={nextPage}
                      disabled={pageNumber >= (numPages || 1)}
                      className="ml-2"
                    />
                  </Tooltip>
                </div>
              )}

              {pdfUrl && (
                <Tooltip title="ดาวน์โหลด PDF">
                  <Button
                    icon={<DownloadOutlined />}
                    type="primary"
                    className="ml-4"
                    href={pdfUrl}
                    target="_blank"
                  >
                    ดาวน์โหลด
                  </Button>
                </Tooltip>
              )}
            </div>
          </div>

          {error && (
            <Alert
              message="เกิดข้อผิดพลาด"
              description={error}
              type="error"
              showIcon
              className="mb-4"
            />
          )}

          <div className="flex justify-center bg-gray-100 p-4 rounded-lg">
            {isLoading && <Spin size="large" className="my-12" />}

            {pdfUrl ? (
              <Document
                file={pdfUrl}
                onLoadSuccess={onDocumentLoadSuccess}
                onLoadError={onDocumentLoadError}
                loading={<Spin size="large" />}
                className="pdf-document"
              >
                <Page
                  pageNumber={pageNumber}
                  scale={scale}
                  renderTextLayer={false}
                  renderAnnotationLayer={false}
                  className="pdf-page"
                />
              </Document>
            ) : (
              renderPlaceholderPDF()
            )}
          </div>

          {numPages && (
            <div className="mt-4 text-center text-gray-500">
              หน้า {pageNumber} จาก {numPages}
            </div>
          )}
        </div>
      </Content>

      <Footer style={{ textAlign: "center" }}>
        PDF Form Builder ©{new Date().getFullYear()}
      </Footer>
    </Layout>
  );
};

export default PDFViewer;
