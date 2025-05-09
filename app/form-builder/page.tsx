"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  DndContext,
  DragEndEvent,
  DragStartEvent,
  DragOverlay,
  pointerWithin,
} from "@dnd-kit/core";
import { Layout, Alert, Button } from "antd";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Document, Page, pdfjs } from "react-pdf";
import { FormSidebar } from "./components/FormSidebar";
import { FormCanvas, DroppedElement } from "./components/FormCanvas";
import { formElements } from "./components/FormElements";
import { catalogPDFs, MockPDF } from "../data/mockPDFs";
import {
  HomeOutlined,
  EyeOutlined,
  ZoomInOutlined,
  ZoomOutOutlined,
  EyeInvisibleOutlined,
  SaveOutlined,
} from "@ant-design/icons";
import { FormItem } from "./types";
import {
  PageFormItems,
  saveCurrentPageObjects,
  restorePageObjects,
  updatePageObjects,
  hasPageObjects,
  countPageObjects,
} from "./utils/pdfFormManager";
import { defaultFormItems } from "../data/defaultFormItems";
import { FormElementConfig, FormElementConfigData } from "./components/FormElementConfig";

// ตั้งค่า worker ของ PDF.js
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

const { Header, Content } = Layout;

// Extend MockPDF to include the items property for form data
interface ExtendedFormData extends MockPDF {
  items: FormItem[];
}

// Create a map of form data keyed by id using the catalogPDFs
const mockPDFFormsData: Record<string, ExtendedFormData> = {};

// Initialize mockPDFFormsData with catalogPDFs and default form items
catalogPDFs.forEach((pdf) => {
  mockPDFFormsData[pdf.key] = {
    ...pdf,
    items: defaultFormItems[pdf.key] || [],
  };
});

// Function to simulate API call
const simulateApiCall = async (formData: {
  formId: string | null;
  formTitle: string;
  pdfFilename: string | null | undefined;
  totalPages: number | null;
  items: FormItem[];
}): Promise<{ success: boolean; message: string }> => {
  console.log("Saving form data:", JSON.stringify(formData, null, 2));

  // Simulate API latency
  await new Promise((resolve) => setTimeout(resolve, 1000));

  // Simulate successful response
  return { success: true, message: "ข้อมูลถูกบันทึกเรียบร้อยแล้ว" };
};

const FormBuilder: React.FC = () => {
  // Regular state
  const [isMounted, setIsMounted] = useState(false);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [draggedItemId, setDraggedItemId] = useState<string | null>(null);
  const [formTitle, setFormTitle] = useState<string>("สร้างฟอร์มใหม่");
  const [formId, setFormId] = useState<string | null>(null);

  // Form items state - now we use per-page storage
  const [currentPageItems, setCurrentPageItems] = useState<FormItem[]>([]);
  const [pageFormItems, setPageFormItems] = useState<PageFormItems>({});

  // PDF viewer state
  const [pdfFile, setPdfFile] = useState<string | null>(null);
  const [numPages, setNumPages] = useState<number | null>(null);
  const [pageNumber, setPageNumber] = useState<number>(1);
  const [scale, setScale] = useState<number>(1.0);
  const [showPdf, setShowPdf] = useState<boolean>(true);
  const [isLoadingPdf, setIsLoadingPdf] = useState<boolean>(false);
  const [pdfDimensions, setPdfDimensions] = useState<{
    width: number;
    height: number;
  } | null>(null);

  // Add a ref to track canvas position
  const canvasRef = React.useRef<HTMLDivElement>(null);
  const pdfFormAreaRef = React.useRef<HTMLDivElement>(null);

  // ดึงพารามิเตอร์ id จาก URL
  const searchParams = useSearchParams();
  const documentId = searchParams.get("id");

  // Add state for zoom presets
  const [zoomPreset, setZoomPreset] = useState<string>("100%");

  // Add state for tracking API call status
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);

  // เพิ่ม state สำหรับเก็บ element ที่กำลังตั้งค่า
  const [configElement, setConfigElement] = useState<FormItem | null>(null);

  // โหลดข้อมูลเมื่อค่า documentId เปลี่ยนแปลง
  useEffect(() => {
    if (documentId && documentId in mockPDFFormsData) {
      const pdfData =
        mockPDFFormsData[documentId as keyof typeof mockPDFFormsData];

      // Initialize form items for page 1
      setCurrentPageItems(pdfData.items);

      // Save items to page 1 in the pageFormItems structure
      const initialPageItems: PageFormItems = {
        1: pdfData.items,
      };
      setPageFormItems(initialPageItems);

      setFormTitle(pdfData.title);
      setFormId(pdfData.key);

      // Load PDF from catalogPDFs
      const foundPdf = catalogPDFs.find((pdf) => pdf.key === documentId);

      if (foundPdf) {
        setIsLoadingPdf(true);
        setPdfFile(`/pdfs/${foundPdf.filename}`);
      }
    }
  }, [documentId]);

  // Handle page changes - save current page items and load new page items
  useEffect(() => {
    if (pageNumber) {
      // First, save the current items before changing
      if (pageNumber > 0) {
        setPageFormItems((prevPageItems) =>
          saveCurrentPageObjects(currentPageItems, pageNumber, prevPageItems)
        );
      }

      // Then load items for the new page (if we're not on the initial render)
      if (Object.keys(pageFormItems).length > 0) {
        setCurrentPageItems(restorePageObjects(pageNumber, pageFormItems));
      }
    }
  }, [pageNumber]);

  // PDF functions
  function onDocumentLoadSuccess({ numPages }: { numPages: number }): void {
    setNumPages(numPages);
    setPageNumber(1);
    setIsLoadingPdf(false);

    // Try to get the actual PDF dimensions from the rendered page
    setTimeout(() => {
      const pageElement = document.querySelector(".react-pdf__Page");
      if (pageElement) {
        const { width, height } = pageElement.getBoundingClientRect();
        if (width > 0 && height > 0) {
          // Store the actual dimensions (unscaled)
          setPdfDimensions({
            width: width / scale,
            height: height / scale,
          });
        }
      }
    }, 500); // Give it time to render
  }

  // Function to handle page changes
  const handlePageChange = (newPageNumber: number) => {
    // Save the current page items before switching
    const updatedPageItems = saveCurrentPageObjects(
      currentPageItems,
      pageNumber,
      pageFormItems
    );

    // Update the page items state
    setPageFormItems(updatedPageItems);

    // Load the items for the new page
    setCurrentPageItems(restorePageObjects(newPageNumber, updatedPageItems));

    // Change the page number
    setPageNumber(newPageNumber);
  };

  // Function to delete an item from the current page
  const handleDeleteItem = (itemId: string) => {
    // Update the current page items by filtering out the deleted item
    const updatedItems = currentPageItems.filter((item) => item.id !== itemId);
    setCurrentPageItems(updatedItems);

    // Update the page items state
    setPageFormItems((prevPageItems) =>
      updatePageObjects(pageNumber, updatedItems, prevPageItems)
    );
  };

  // Function to check if a page has items
  const pageHasItems = (page: number) => {
    return hasPageObjects(page, pageFormItems);
  };

  // Function to get the count of items on a page
  const getPageItemCount = (page: number) => {
    return countPageObjects(page, pageFormItems);
  };

  // Enhanced zoom functions
  function zoomIn() {
    setScale((prevScale) => {
      const newScale = Math.min(prevScale + 0.1, 3.0);
      setZoomPreset(`${Math.round(newScale * 100)}%`);
      return newScale;
    });
  }

  function zoomOut() {
    setScale((prevScale) => {
      const newScale = Math.max(prevScale - 0.1, 0.1);
      setZoomPreset(`${Math.round(newScale * 100)}%`);
      return newScale;
    });
  }

  function fitToScreen() {
    if (!pdfDimensions || !canvasRef.current) return;

    const container = canvasRef.current.getBoundingClientRect();
    const widthRatio = (container.width * 0.9) / pdfDimensions.width;
    const heightRatio = (container.height * 0.9) / pdfDimensions.height;

    // Use the smaller ratio to ensure the PDF fits completely
    const newScale = Math.min(widthRatio, heightRatio);
    setScale(newScale);
    setZoomPreset("Fit");
  }

  function zoomToActualSize() {
    setScale(1.0);
    setZoomPreset("100%");
  }

  // Add keyboard shortcuts for zooming
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Only listen for keyboard shortcuts when the form builder is active
      if (e.ctrlKey || e.metaKey) {
        switch (e.key) {
          case "=": // Ctrl/Cmd + Plus (=)
          case "+":
            e.preventDefault();
            zoomIn();
            break;
          case "-": // Ctrl/Cmd + Minus
            e.preventDefault();
            zoomOut();
            break;
          case "0": // Ctrl/Cmd + 0
            e.preventDefault();
            zoomToActualSize();
            break;
          case "\\": // Ctrl/Cmd + \
            e.preventDefault();
            fitToScreen();
            break;
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [pdfDimensions]); // Add dependencies as needed

  function togglePdfVisibility() {
    setShowPdf((prevShow) => !prevShow);
  }

  // Initialize DnD only on client-side
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Memoize handlers to prevent recreation on each render
  const handleDragStart = useCallback((event: DragStartEvent) => {
    const { active } = event;
    setActiveId(active.id as string);

    // Only set draggedItemId for dropped elements, not sidebar elements
    if (active.id.toString().startsWith("dropped-")) {
      setDraggedItemId(active.id.toString().replace("dropped-", ""));
    }
  }, []);

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over, delta } = event;
      setActiveId(null);

      // Case 1: Dragging from sidebar to canvas
      if (
        over &&
        over.id === "form-canvas" &&
        !active.id.toString().startsWith("dropped-")
      ) {
        // Find the dragged element from available elements
        const draggedElement = formElements.find(
          (item) => item.id === active.id
        );

        if (draggedElement) {
          try {
            // Get the mouse position from the event
            const activatorEvent = event.activatorEvent as MouseEvent;
            
            // Get PDF area element to calculate position relative to PDF
            const pdfArea = pdfFormAreaRef.current || document.querySelector(".pdf-form-area");
            if (!pdfArea) {
              console.error("PDF area not found");
              return;
            }
            
            // Get the PDF area's bounds
            const pdfRect = pdfArea.getBoundingClientRect();
            
            // Calculate position directly relative to PDF area
            // Subtracting the pdf's position from the mouse position gives us coordinates inside the PDF
            const posX = activatorEvent.clientX - pdfRect.left;
            const posY = activatorEvent.clientY - pdfRect.top;
            
            // We need to divide by the current scale to store positions in the unscaled coordinate system
            // This is important because the PDF is rendered at a scale, but we store positions at scale=1
            const adjustedPosX = posX / scale;
            const adjustedPosY = posY / scale;
            
            // Add a new item to the form with a unique ID
            const newFormItem: FormItem = {
              ...draggedElement,
              id: `${draggedElement.id}-${Date.now()}`, // Create a unique ID
              position: { x: adjustedPosX, y: adjustedPosY },
              pageNumber: pageNumber, // Associate with the current page
            };

            // Update current page items
            const updatedItems = [...currentPageItems, newFormItem];
            setCurrentPageItems(updatedItems);
            
            // Update page form items
            setPageFormItems((prevPageItems) =>
              updatePageObjects(pageNumber, updatedItems, prevPageItems)
            );
          } catch (error) {
            console.error("Error calculating drop position:", error);
          }
        }
      }

      // Case 2: Repositioning elements within the canvas
      if (active.id.toString().startsWith("dropped-")) {
        const originalId = active.id.toString().replace("dropped-", "");

        // We need to adjust the delta based on the current scale
        // The delta is in screen pixels, but our positions are stored in unscaled coordinates
        const updatedItems = currentPageItems.map((item) => {
          if (item.id === originalId) {
            return {
              ...item,
              position: {
                x: item.position.x + delta.x / scale,
                y: item.position.y + delta.y / scale,
              },
            };
          }
          return item;
        });
        
        // Update current page items
        setCurrentPageItems(updatedItems);
        
        // Update page form items
        setPageFormItems((prevPageItems) =>
          updatePageObjects(pageNumber, updatedItems, prevPageItems)
        );
      }

      // Reset the draggedItemId
      setDraggedItemId(null);
    },
    [pageNumber, currentPageItems, scale]
  );

  // Find the active element for overlay - memoize to prevent recalculation on each render
  const activeElement = useMemo(() => {
    if (!activeId) return null;

    return activeId.toString().startsWith("dropped-")
      ? currentPageItems.find((item) => `dropped-${item.id}` === activeId)
      : formElements.find((item) => item.id === activeId);
  }, [activeId, currentPageItems]);

  // Memoize the empty state to prevent recreation on each render
  const emptyCanvasContent = useMemo(
    () => (
      <div className="flex items-center justify-center h-full text-gray-400">
        ลากและวางองค์ประกอบฟอร์มที่นี่
      </div>
    ),
    []
  );

  // Update handleValueChange function for form items
  const handleFormItemValueChange = (
    id: string,
    newValue: string | string[] | boolean | number,
    checkboxOptions?: string[]
  ) => {
    // Update the value in currentPageItems
    const updatedItems = currentPageItems.map((item) => {
      if (item.id === id) {
        // Return updated item with new value and possibly new checkbox options
        return checkboxOptions !== undefined
          ? { ...item, value: newValue, checkboxOptions }
          : { ...item, value: newValue };
      }
      return item;
    });

    // Update current page items
    setCurrentPageItems(updatedItems);

    // Update page form items
    setPageFormItems((prevPageItems) =>
      updatePageObjects(pageNumber, updatedItems, prevPageItems)
    );
  };

  // ปรับปรุงฟังก์ชันเมื่อคลิกที่ปุ่มตั้งค่า
  const handleOpenConfigPanel = (item: FormItem) => {
    setConfigElement(item);
  };

  // ปรับปรุงฟังก์ชันเมื่อปิดแผงตั้งค่า
  const handleCloseConfigPanel = () => {
    setConfigElement(null);
  };

  // Function to handle form element configuration changes
  const handleFormElementConfig = (itemId: string, configData: FormElementConfigData) => {
    // Update the current page items with the new configuration
    const updatedItems = currentPageItems.map((item) => {
      if (item.id === itemId) {
        // Create a new item with updated configuration
        return {
          ...item,
          label: configData.label,
          checkboxOptions: configData.checkboxOptions || item.checkboxOptions,
          config: {
            ...(item.config || {}), // Ensure config exists
            maxLength: configData.maxLength,
            required: configData.required,
            placeholder: configData.placeholder,
          },
        };
      }
      return item;
    });

    // Update current page items
    setCurrentPageItems(updatedItems);

    // Update the page items state
    setPageFormItems((prevPageItems) =>
      updatePageObjects(pageNumber, updatedItems, prevPageItems)
    );
  };

  // Save form data to API
  const handleSaveForm = async () => {
    try {
      setIsSaving(true);
      setSaveMessage(null);

      // Prepare data for API with proper null check on pdfFilename
      const filename = pdfFile ? pdfFile.split("/").pop() : null;
      const formData = {
        formId: formId,
        formTitle: formTitle,
        pdfFilename: filename,
        totalPages: numPages,
        items: Object.entries(pageFormItems).flatMap(([pageNum, items]) =>
          items.map((item: FormItem) => ({
            ...item,
            pageNumber: parseInt(pageNum),
          }))
        ),
      };

      // Call API (simulated)
      const response = await simulateApiCall(formData);

      // Show success message
      if (response.success) {
        setSaveMessage(response.message);
        // You might want to add a timeout to clear the message after a few seconds
        setTimeout(() => setSaveMessage(null), 3000);
      }
    } catch (error) {
      console.error("Error saving form:", error);
      setSaveMessage("เกิดข้อผิดพลาดในการบันทึกข้อมูล");
    } finally {
      setIsSaving(false);
    }
  };

  // Memoize the form items rendering
  const formItemsContent = useMemo(
    () =>
      currentPageItems
        .filter((item) => item.id !== draggedItemId)
        .map((item) => (
          <DroppedElement
            key={item.id}
            id={item.id}
            type={item.type}
            label={item.label}
            position={item.position}
            value={item.value}
            checkboxOptions={item.checkboxOptions}
            maxLength={item.config?.maxLength}
            required={item.config?.required}
            placeholder={item.config?.placeholder}
            onValueChange={(newValue, checkboxOptions) =>
              handleFormItemValueChange(item.id, newValue, checkboxOptions)
            }
            onConfigChange={(configData) => handleFormElementConfig(item.id, configData)}
            onConfigClick={() => handleOpenConfigPanel(item)}
          />
        )),
    [currentPageItems, draggedItemId, handleDeleteItem]
  );

  // Memoize the drag overlay
  const dragOverlayContent = useMemo(
    () =>
      activeElement && (
        <div className="opacity-80">
          <DroppedElement
            id={activeElement.id}
            type={activeElement.type}
            label={activeElement.label}
            position={{ x: 0, y: 0 }}
          />
        </div>
      ),
    [activeElement]
  );

  // Create pagination indicator component
  const PaginationIndicator = useMemo(() => {
    if (!numPages || numPages <= 1) return null;

    return (
      <div className="mt-4 flex justify-center items-center">
        <div className="flex items-center">
          {Array.from({ length: numPages }, (_, i) => i + 1).map((page) => (
            <button
              key={page}
              onClick={() => handlePageChange(page)}
              className={`mx-1 w-8 h-8 flex items-center justify-center rounded-full ${
                pageNumber === page
                  ? "bg-blue-500 text-white"
                  : pageHasItems(page)
                  ? "bg-green-100 text-green-800"
                  : "bg-gray-100 text-gray-700"
              }`}
              title={`หน้า ${page}${
                pageHasItems(page) ? ` (${getPageItemCount(page)} รายการ)` : ""
              }`}
            >
              {page}
            </button>
          ))}
        </div>
      </div>
    );
  }, [numPages, pageNumber, pageFormItems]);

  // Update zoom preset dropdown options
  const zoomOptions = [
    { value: "Fit", label: "Fit to Screen" },
    { value: "50%", label: "50%" },
    { value: "75%", label: "75%" },
    { value: "100%", label: "100%" },
    { value: "125%", label: "125%" },
    { value: "150%", label: "150%" },
    { value: "200%", label: "200%" },
  ];

  // Handle zoom preset change
  const handleZoomChange = (value: string) => {
    setZoomPreset(value);

    if (value === "Fit") {
      fitToScreen();
    } else {
      // Extract percentage value
      const percentage = parseInt(value);
      if (!isNaN(percentage)) {
        setScale(percentage / 100);
      }
    }
  };

  return (
    <Layout style={{ minHeight: "100vh", height: "auto", overflow: "hidden" }}>
      <Header
        style={{
          position: "sticky",
          top: 0,
          zIndex: 9999,
          width: "100%",
          display: "flex",
          alignItems: "center",
        }}
      >
        <div className="text-xl font-bold text-white mr-6">
          PDF Form Builder
        </div>
        <div className="flex-1">
          <Link href="/">
            <Button type="primary" icon={<HomeOutlined />} className="mr-2">
              หน้าหลัก
            </Button>
          </Link>
          {documentId && (
            <Link href={`/pdf-viewer?id=${documentId}`}>
              <Button type="default" icon={<EyeOutlined />} className="mr-2">
                ดู PDF
              </Button>
            </Link>
          )}
          {pdfFile && (
            <Button
              type="default"
              icon={showPdf ? <EyeInvisibleOutlined /> : <EyeOutlined />}
              onClick={togglePdfVisibility}
              className="mr-2"
            >
              {showPdf ? "ซ่อน PDF" : "แสดง PDF"}
            </Button>
          )}
          {pdfFile && showPdf && (
            <>
              <Button
                type="default"
                icon={<ZoomOutOutlined />}
                onClick={zoomOut}
                className="mr-2"
              />
              <div className="px-2 min-w-[60px] text-center">
                <select
                  value={zoomPreset}
                  onChange={(e) => handleZoomChange(e.target.value)}
                  className="bg-transparent border-none outline-none cursor-pointer"
                  aria-label="Zoom level"
                  title="Zoom level"
                >
                  {zoomOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
              <Button
                type="default"
                icon={<ZoomInOutlined />}
                onClick={zoomIn}
                className="ml-2 mr-4"
              />
            </>
          )}
          <Button
            type="primary"
            icon={<SaveOutlined />}
            onClick={handleSaveForm}
            loading={isSaving}
          >
            บันทึกฟอร์ม
          </Button>
          {saveMessage && (
            <span className="text-green-500 ml-2">{saveMessage}</span>
          )}
        </div>
      </Header>
      <Content className="p-6" style={{ height: "auto", overflow: "scroll" }}>
        {documentId && !(documentId in mockPDFFormsData) && (
          <Alert
            message="ไม่พบข้อมูลเอกสาร"
            description="ไม่พบเอกสารตาม ID ที่ระบุ กรุณาเลือกเอกสารใหม่จากหน้ารายการเอกสาร"
            type="error"
            showIcon
            className="mb-4"
          />
        )}

        {isMounted ? (
          <DndContext
            collisionDetection={pointerWithin}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
            autoScroll={true}
          >
            <div className="flex justify-between items-center mb-4">
              <h1 className="text-2xl font-bold">{formTitle}</h1>
              {formId && <div className="text-gray-500">ID: {formId}</div>}
            </div>

            <div className="flex min-h-screen rounded-lg">
              <FormSidebar />
              <div className="flex-1 h-full">
                <div
                  ref={canvasRef}
                  className="relative w-full h-full"
                  style={{
                    minHeight: "600px",
                    flex: 1,
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "flex-start",
                  }}
                >
                  {pdfFile && showPdf && (
                    <div className="flex justify-center items-start pointer-events-none z-0 w-full h-full">
                      <div className="relative flex justify-center w-auto h-auto">
                        <Document
                          file={pdfFile}
                          onLoadSuccess={onDocumentLoadSuccess}
                          loading={
                            <div className="flex justify-center items-center h-[600px]">
                              {isLoadingPdf && "กำลังโหลด PDF..."}
                            </div>
                          }
                        >
                          <Page
                            pageNumber={pageNumber}
                            scale={scale}
                            renderTextLayer={false}
                            renderAnnotationLayer={false}
                            className="shadow-md max-w-full"
                            width={undefined}
                          />
                        </Document>
                      </div>
                    </div>
                  )}
                  <FormCanvas
                    hasPdfBackground={!!(pdfFile && showPdf)}
                    pdfDimensions={pdfDimensions || undefined}
                    scale={scale}
                    ref={pdfFormAreaRef}
                  >
                    {currentPageItems.length === 0
                      ? emptyCanvasContent
                      : formItemsContent}
                  </FormCanvas>
                </div>
                {pdfFile && showPdf && numPages && (
                  <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 flex flex-col items-center bg-white rounded-lg shadow-lg p-2 z-50">
                    <div className="flex items-center">
                      <Button
                        type="default"
                        icon={<ZoomOutOutlined />}
                        onClick={zoomOut}
                        className="mr-2"
                      />
                      <div className="px-2 min-w-[60px] text-center">
                        <select
                          value={zoomPreset}
                          onChange={(e) => handleZoomChange(e.target.value)}
                          className="bg-transparent border-none outline-none cursor-pointer"
                          aria-label="ระดับการซูม"
                          title="ระดับการซูม"
                        >
                          {zoomOptions.map((option) => (
                            <option key={option.value} value={option.value}>
                              {option.label}
                            </option>
                          ))}
                        </select>
                      </div>
                      <Button
                        type="default"
                        icon={<ZoomInOutlined />}
                        onClick={zoomIn}
                        className="ml-2 mr-4"
                      />

                      <span>หน้า&nbsp;</span>

                      <span>
                        {pageNumber} / {numPages}
                      </span>
                    </div>

                    {/* Show pagination indicator with item counts */}
                    {PaginationIndicator}
                  </div>
                )}
              </div>
              
              {/* Right Config Sidebar */}
              <div className={`transition-all duration-300 ${configElement ? 'translate-x-0' : 'translate-x-full'}`}>
                {configElement && (
                  <FormElementConfig
                    id={configElement.id}
                    type={configElement.type}
                    label={configElement.label}
                    checkboxOptions={configElement.checkboxOptions}
                    maxLength={configElement.config?.maxLength}
                    required={configElement.config?.required}
                    placeholder={configElement.config?.placeholder}
                    value={configElement.value}
                    onConfigChange={(configData) => {
                      handleFormElementConfig(configElement.id, configData);
                    }}
                    onValueChange={(newValue, checkboxOptions) => {
                      handleFormItemValueChange(configElement.id, newValue, checkboxOptions);
                    }}
                    onClose={handleCloseConfigPanel}
                    onDelete={() => {
                      handleDeleteItem(configElement.id);
                      handleCloseConfigPanel();
                    }}
                  />
                )}
              </div>
            </div>
            <DragOverlay>{dragOverlayContent}</DragOverlay>
          </DndContext>
        ) : (
          <div className="flex min-h-screen bg-white rounded-lg">
            <div className="w-64 p-4 bg-gray-50 border-r border-gray-200">
              <h2 className="mb-4 text-lg font-semibold">องค์ประกอบฟอร์ม</h2>
            </div>
            <div className="flex-1">
              <h1 className="mb-4 text-2xl font-bold">{formTitle}</h1>
              <div className="w-full h-[600px] bg-white border-2 border-dashed border-gray-300 rounded-lg relative">
                <div className="flex items-center justify-center h-full text-gray-400">
                  กำลังโหลด Form Builder...
                </div>
              </div>
            </div>
          </div>
        )}
      </Content>
    </Layout>
  );
};

export default FormBuilder;
