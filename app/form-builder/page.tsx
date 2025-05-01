'use client'

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { DndContext, DragEndEvent, DragStartEvent, DragOverlay, pointerWithin } from '@dnd-kit/core';
import { Layout, Alert, Button } from 'antd';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { FormSidebar } from './components/FormSidebar';
import { FormCanvas, DroppedElement } from './components/FormCanvas';
import { formElements } from './components/FormElements';
import { formPDFs, MockPDF } from '../data/mockPDFs';
import { HomeOutlined, EyeOutlined } from '@ant-design/icons';

const { Header, Content, Footer } = Layout;

interface FormItem {
  id: string;
  type: string;
  label: string;
  position: { x: number, y: number };
}

// Extend MockPDF to include the items property for form data
interface FormData extends MockPDF {
  items: FormItem[];
}

// Create a map of form data keyed by id using the formPDFs data
const mockPDFFormsData: Record<string, FormData> = {
  '1': {
    ...formPDFs[0],
    items: [
      { id: 'text-input-1', type: 'text', label: 'ชื่อ-นามสกุล', position: { x: 20, y: 50 } },
      { id: 'text-input-2', type: 'text', label: 'อีเมล', position: { x: 250, y: 50 } },
      { id: 'text-input-3', type: 'text', label: 'เบอร์โทรศัพท์', position: { x: 20, y: 150 } },
      { id: 'textarea-1', type: 'textarea', label: 'ที่อยู่', position: { x: 250, y: 150 } },
    ]
  },
  '2': {
    ...formPDFs[1],
    items: [
      { id: 'text-input-1', type: 'text', label: 'ชื่อผู้สมัคร', position: { x: 20, y: 50 } },
      { id: 'text-input-2', type: 'text', label: 'ตำแหน่งที่สมัคร', position: { x: 250, y: 50 } },
      { id: 'number-input-1', type: 'number', label: 'เงินเดือนที่ต้องการ', position: { x: 20, y: 150 } },
      { id: 'textarea-1', type: 'textarea', label: 'ประสบการณ์ทำงาน', position: { x: 20, y: 250 } },
    ]
  },
  '3': {
    ...formPDFs[2],
    items: [
      { id: 'text-input-1', type: 'text', label: 'ชื่อผู้ตอบแบบสอบถาม', position: { x: 20, y: 50 } },
      { id: 'select-1', type: 'select', label: 'ระดับความพึงพอใจ', position: { x: 20, y: 150 } },
      { id: 'textarea-1', type: 'textarea', label: 'ข้อเสนอแนะ', position: { x: 20, y: 250 } },
    ]
  },
  '4': {
    ...formPDFs[3],
    items: [
      { id: 'text-input-1', type: 'text', label: 'ชื่อผู้เบิก', position: { x: 20, y: 50 } },
      { id: 'number-input-1', type: 'number', label: 'จำนวนเงิน', position: { x: 250, y: 50 } },
      { id: 'textarea-1', type: 'textarea', label: 'รายละเอียด', position: { x: 20, y: 150 } },
    ]
  },
  '5': {
    ...formPDFs[4],
    items: [
      { id: 'text-input-1', type: 'text', label: 'ชื่อผู้ลา', position: { x: 20, y: 50 } },
      { id: 'text-input-2', type: 'text', label: 'แผนก', position: { x: 250, y: 50 } },
      { id: 'text-input-3', type: 'text', label: 'ประเภทการลา', position: { x: 20, y: 150 } },
      { id: 'textarea-1', type: 'textarea', label: 'เหตุผลการลา', position: { x: 250, y: 150 } },
    ]
  }
};

const FormBuilder: React.FC = () => {
  const [formItems, setFormItems] = useState<FormItem[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [isMounted, setIsMounted] = useState(false);
  const [draggedItemId, setDraggedItemId] = useState<string | null>(null);
  const [formTitle, setFormTitle] = useState<string>('สร้างฟอร์มใหม่');
  const [formId, setFormId] = useState<string | null>(null);
  
  // Add a ref to track canvas position
  const canvasRef = React.useRef<HTMLDivElement>(null);
  
  // ดึงพารามิเตอร์ id จาก URL
  const searchParams = useSearchParams();
  const documentId = searchParams.get('id');

  // โหลดข้อมูลเมื่อค่า documentId เปลี่ยนแปลง
  useEffect(() => {
    if (documentId && documentId in mockPDFFormsData) {
      const pdfData = mockPDFFormsData[documentId as keyof typeof mockPDFFormsData];
      setFormItems(pdfData.items);
      setFormTitle(pdfData.title);
      setFormId(pdfData.key);
    }
  }, [documentId]);

  // Initialize DnD only on client-side
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Memoize handlers to prevent recreation on each render
  const handleDragStart = useCallback((event: DragStartEvent) => {
    const { active } = event;
    setActiveId(active.id as string);
    
    // Only set draggedItemId for dropped elements, not sidebar elements
    if (active.id.toString().startsWith('dropped-')) {
      setDraggedItemId(active.id.toString().replace('dropped-', ''));
    }
  }, []);

  const handleDragEnd = useCallback((event: DragEndEvent) => {
    const { active, over, delta } = event;
    setActiveId(null);
    
    // Case 1: Dragging from sidebar to canvas
    if (over && over.id === 'form-canvas' && !active.id.toString().startsWith('dropped-')) {
      // Find the dragged element from available elements
      const draggedElement = formElements.find(item => item.id === active.id);
      
      if (draggedElement) {
        // Get canvas coordinates
        const canvas = canvasRef.current?.getBoundingClientRect();
        
        // If we have the canvas boundaries, calculate the position relative to the canvas
        let posX = 10;
        let posY = 10;
        
        if (canvas && event.activatorEvent instanceof MouseEvent) {
          const mouseX = event.activatorEvent.clientX;
          const mouseY = event.activatorEvent.clientY;
          
          // Calculate position relative to canvas
          posX = Math.max(0, Math.min(mouseX - canvas.left - 50, canvas.width - 150));
          posY = Math.max(0, Math.min(mouseY - canvas.top - 20, canvas.height - 50));
        }
        
        // Add a new item to the form with a unique ID
        const newFormItem = {
          ...draggedElement,
          id: `${draggedElement.id}-${Date.now()}`, // Create a unique ID
          position: { x: posX, y: posY }
        };
        
        setFormItems(prevItems => [...prevItems, newFormItem]);
      }
    }
    
    // Case 2: Repositioning elements within the canvas
    if (active.id.toString().startsWith('dropped-')) {
      const originalId = active.id.toString().replace('dropped-', '');
      
      // Update the position of the dragged element
      setFormItems(items => 
        items.map(item => {
          if (item.id === originalId) {
            return {
              ...item,
              position: {
                x: item.position.x + delta.x,
                y: item.position.y + delta.y
              }
            };
          }
          return item;
        })
      );
    }
    
    // Reset the draggedItemId
    setDraggedItemId(null);
  }, []);

  // Find the active element for overlay - memoize to prevent recalculation on each render
  const activeElement = useMemo(() => {
    if (!activeId) return null;
    
    return activeId.toString().startsWith('dropped-') 
      ? formItems.find(item => `dropped-${item.id}` === activeId)
      : formElements.find(item => item.id === activeId);
  }, [activeId, formItems]);

  // Memoize the empty state to prevent recreation on each render
  const emptyCanvasContent = useMemo(() => (
    <div className="flex items-center justify-center h-full text-gray-400">
      ลากและวางองค์ประกอบฟอร์มที่นี่
    </div>
  ), []);

  // Memoize the form items rendering to prevent recreation on each render
  // Filter out the item being dragged to avoid duplication
  const formItemsContent = useMemo(() => (
    formItems
      .filter(item => item.id !== draggedItemId) // Remove the item being dragged
      .map(item => (
        <DroppedElement
          key={item.id}
          id={item.id}
          type={item.type}
          label={item.label}
          position={item.position}
        />
      ))
  ), [formItems, draggedItemId]);

  // Memoize the drag overlay
  const dragOverlayContent = useMemo(() => (
    activeElement && (
      <div className="opacity-80">
        <DroppedElement
          id={activeElement.id}
          type={activeElement.type}
          label={activeElement.label}
          position={{ x: 0, y: 0 }}
        />
      </div>
    )
  ), [activeElement]);

  return (
    <Layout>
      <Header
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 1,
          width: '100%',
          display: 'flex',
          alignItems: 'center',
        }}
      >
        <div className="text-xl font-bold text-white mr-6">PDF Form Builder</div>
        <div className="flex-1">
          <Link href="/">
            <Button type="primary" icon={<HomeOutlined />} className="mr-2">
              หน้าหลัก
            </Button>
          </Link>
          {documentId && (
            <Link href={`/pdf-viewer?id=${documentId}`}>
              <Button type="default" icon={<EyeOutlined />}>
                ดู PDF
              </Button>
            </Link>
          )}
        </div>
      </Header>
      <Content className="p-6">
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
          >
            <div className="flex min-h-screen bg-white rounded-lg">
              <FormSidebar />
              <div className="flex-1 p-6">
                <div className="flex justify-between items-center mb-4">
                  <h1 className="text-2xl font-bold">{formTitle}</h1>
                  {formId && <div className="text-gray-500">ID: {formId}</div>}
                </div>
                <div ref={canvasRef} className="relative" style={{ height: '600px', overflow: 'hidden' }}>
                  <FormCanvas>
                    {formItems.length === 0 ? emptyCanvasContent : formItemsContent}
                  </FormCanvas>
                </div>
              </div>
            </div>
            <DragOverlay>
              {dragOverlayContent}
            </DragOverlay>
          </DndContext>
        ) : (
          <div className="flex min-h-screen bg-white rounded-lg">
            <div className="w-64 p-4 bg-gray-50 border-r border-gray-200">
              <h2 className="mb-4 text-lg font-semibold">องค์ประกอบฟอร์ม</h2>
            </div>
            <div className="flex-1 p-6">
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
      <Footer style={{ textAlign: 'center' }}>
        PDF Form Builder ©{new Date().getFullYear()}
      </Footer>
    </Layout>
  );
};

export default FormBuilder; 