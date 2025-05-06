"use client";

import React, {
  CSSProperties,
  useMemo,
  useState,
  useEffect,
  useRef,
} from "react";
import { useDroppable } from "@dnd-kit/core";
import { useDraggable } from "@dnd-kit/core";
import { FiMove } from "react-icons/fi";

interface FormCanvasProps {
  children: React.ReactNode;
  hasPdfBackground?: boolean;
  pdfDimensions?: { width: number; height: number };
  scale?: number;
}

export const FormCanvas: React.FC<FormCanvasProps> = ({
  children,
  hasPdfBackground = false,
  pdfDimensions,
  scale = 1,
}) => {
  const { setNodeRef } = useDroppable({
    id: "form-canvas",
  });

  const canvasRef = useRef<HTMLDivElement>(null);
  const [canvasScale, setCanvasScale] = useState(1);
  const [pdfRect, setPdfRect] = useState<{
    width: number;
    height: number;
    top: number;
    left: number;
  }>({
    width: 0,
    height: 0,
    top: 0,
    left: 0,
  });

  // Monitor window resize and zoom level changes
  useEffect(() => {
    const handleResize = () => {
      if (canvasRef.current) {
        // Find the PDF element to get exact dimensions
        const pdfPage = document.querySelector('.react-pdf__Page');
        
        if (pdfPage && pdfDimensions) {
          // Get the actual rendered PDF dimensions
          const pdfRect = pdfPage.getBoundingClientRect();
          const canvasContainer = canvasRef.current.parentElement;
          
          if (canvasContainer) {
            const containerRect = canvasContainer.getBoundingClientRect();
            
            // Calculate the scaling based on actual PDF dimensions
            const newScale = scale;
            
            // Set PDF rect to match the actual PDF element position
            setPdfRect({
              width: pdfRect.width,
              height: pdfRect.height,
              top: pdfRect.top - containerRect.top,
              left: pdfRect.left - containerRect.left,
            });
            
            setCanvasScale(newScale);
          }
        } else {
          // Fallback if PDF element isn't found
          const containerWidth = canvasRef.current.parentElement?.clientWidth || window.innerWidth;
          
          let newScale = 1;
          
          if (pdfDimensions) {
            // For width, calculate optimal scale to fit PDF width in container
            const widthScale = containerWidth / pdfDimensions.width;
            
            // Use the width scale, allow height to scroll
            newScale = widthScale * scale;
            
            // Calculate PDF rectangle within container
            const scaledWidth = pdfDimensions.width * newScale;
            const scaledHeight = pdfDimensions.height * newScale;
            
            // Center the PDF horizontally
            const left = (containerWidth - scaledWidth) / 2;
            
            setPdfRect({
              width: scaledWidth,
              height: scaledHeight,
              top: 0, // Top aligned for scrolling
              left: left,
            });
          } else {
            // Calculate a scale factor based on a reference width if no PDF dimensions
            const referenceWidth = 1200;
            newScale = Math.min(containerWidth / referenceWidth, 1.5) * scale;
            setCanvasScale(newScale);
          }
        }
      }
    };

    // Call handleResize immediately
    handleResize();
    
    // Create a MutationObserver to detect when the PDF is rendered
    const observer = new MutationObserver((mutations) => {
      const pdfPageRendered = mutations.some(mutation => 
        Array.from(mutation.addedNodes).some(node => 
          node instanceof Element && node.classList.contains('react-pdf__Page')
        )
      );
      
      if (pdfPageRendered) {
        // Allow a moment for the PDF to fully render
        setTimeout(handleResize, 50);
      }
    });
    
    // Start observing the document body
    observer.observe(document.body, { childList: true, subtree: true });
    
    // Add event listeners
    window.addEventListener("resize", handleResize);
    window.addEventListener("orientationchange", handleResize);
    window.addEventListener("wheel", (e) => {
      if (e.ctrlKey) {
        handleResize();
      }
    });
    
    return () => {
      observer.disconnect();
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("orientationchange", handleResize);
      window.removeEventListener("wheel", handleResize);
    };
  }, [pdfDimensions, scale]);

  const canvasClasses = `w-full h-full ${
    hasPdfBackground
      ? "bg-transparent"
      : "bg-white border-2 border-dashed border-gray-300"
  } rounded-lg relative`;

  // Get the canvas style based on PDF dimensions
  const canvasStyle = useMemo(() => {
    if (!hasPdfBackground || !pdfDimensions) {
      return {
        position: "relative" as const,
        width: "100%",
        height: "100%",
      };
    }
    
    return {
      width: "100%",
      height: "100%",
      position: "absolute" as const,
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      pointerEvents: "none" as const,
    };
  }, [hasPdfBackground, pdfDimensions]);

  // Create a positioned container for the PDF area only
  const pdfAreaStyle = useMemo(() => {
    if (!hasPdfBackground || !pdfDimensions) {
      return {};
    }
    
    return {
      position: "absolute" as const,
      width: `${pdfRect.width}px`,
      height: `${pdfRect.height}px`,
      top: `${pdfRect.top}px`,
      left: `${pdfRect.left}px`,
      background: "transparent",
      pointerEvents: "all" as const,
      zIndex: 10,
    };
  }, [hasPdfBackground, pdfDimensions, pdfRect]);

  return (
    <div
      ref={(node) => {
        // Combine refs
        setNodeRef(node);
        if (canvasRef.current !== node) {
          canvasRef.current = node as HTMLDivElement | null;
        }
      }}
      className={canvasClasses}
      suppressHydrationWarning
      style={canvasStyle}
      data-scale={canvasScale}
    >
      {hasPdfBackground && pdfDimensions ? (
        <div
          className="pdf-form-area"
          style={pdfAreaStyle}
          data-pdf-width={pdfRect.width}
          data-pdf-height={pdfRect.height}
        >
          {children}
        </div>
      ) : (
        children
      )}
    </div>
  );
};

// CheckboxOptions component for handling checkbox options with add/remove functionality
const CheckboxOptions: React.FC<{ id: string }> = ({ id }) => {
  const [options, setOptions] = useState([
    "ตัวเลือกที่ 1",
    "ตัวเลือกที่ 2",
    "ตัวเลือกที่ 3",
  ]);

  const addOption = () => {
    setOptions([...options, `ตัวเลือกที่ ${options.length + 1}`]);
  };

  const removeOption = (index: number) => {
    setOptions(options.filter((_, i) => i !== index));
  };

  return (
    <>
      {options.map((option, index) => (
        <div key={index} className="flex items-center w-full mb-2">
          <input
            type="checkbox"
            className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
            id={`checkbox-${id}-${index}`}
            aria-label={option}
            value={option}
            title={option}
          />
          <label
            htmlFor={`checkbox-${id}-${index}`}
            className="ml-2 w-full min-w-fit"
          >
            {option}
          </label>
          <button
            type="button"
            onClick={() => removeOption(index)}
            className="text-red-500 ml-2 hover:text-red-700"
            aria-label="ลบตัวเลือก"
          >
            ✕
          </button>
        </div>
      ))}
      <button
        type="button"
        onClick={addOption}
        className="mt-2 px-2 py-1 text-sm bg-blue-100 hover:bg-blue-200 text-blue-800 rounded flex items-center"
      >
        <span className="mr-1">+</span> เพิ่มตัวเลือก
      </button>
    </>
  );
};

export const DroppedElement: React.FC<{
  id: string;
  type: string;
  label: string;
  position?: { x: number; y: number };
}> = ({ id, type, label, position }) => {
  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({
      id: `dropped-${id}`,
    });

  const [parentScale, setParentScale] = useState(1);
  const [pdfDimensions, setPdfDimensions] = useState<{
    width: number;
    height: number;
  } | null>(null);
  const elementRef = useRef<HTMLDivElement>(null);

  // Get the canvas scale and PDF dimensions from parent elements
  useEffect(() => {
    const updateFromParent = () => {
      if (elementRef.current) {
        // Try to find the FormCanvas parent
        let parent = elementRef.current.parentElement;
        let pdfAreaElement = null;

        while (parent) {
          if (parent.hasAttribute("data-scale")) {
            const scale = parseFloat(parent.getAttribute("data-scale") || "1");
            setParentScale(scale);
          }

          if (parent.classList.contains("pdf-form-area")) {
            pdfAreaElement = parent;
          }

          parent = parent.parentElement;
        }

        // Get PDF dimensions if available
        if (pdfAreaElement) {
          const width = parseFloat(
            pdfAreaElement.getAttribute("data-pdf-width") || "0"
          );
          const height = parseFloat(
            pdfAreaElement.getAttribute("data-pdf-height") || "0"
          );

          if (width && height) {
            setPdfDimensions({ width, height });
          }
        }
      }
    };

    updateFromParent();

    // Add resize listener to recalculate on window resize
    window.addEventListener("resize", updateFromParent);
    return () => {
      window.removeEventListener("resize", updateFromParent);
    };
  }, []);

  // Adjust position based on parent scale and constrain to PDF area
  const adjustedPosition = useMemo(() => {
    if (!position) return { x: 0, y: 0 };

    let posX = position.x * parentScale;
    let posY = position.y * parentScale;

    // Constrain to PDF dimensions if available
    if (pdfDimensions) {
      posX = Math.max(
        0,
        Math.min(posX, pdfDimensions.width - 180 * parentScale)
      ); // 180px is approx maxWidth
      posY = Math.max(
        0,
        Math.min(posY, pdfDimensions.height - 50 * parentScale)
      ); // 50px is approx height
    }

    return { x: posX, y: posY };
  }, [position?.x, position?.y, parentScale, pdfDimensions]);

  // Use useMemo to create a stable reference for the style object
  const style = useMemo<CSSProperties>(
    () => ({
      position: "absolute",
      top: adjustedPosition.y,
      left: adjustedPosition.x,
      zIndex: isDragging ? 1000 : 10, // Higher z-index to ensure visibility over PDF
      width: "calc(100% - 20px)",
      maxWidth: `${180 * parentScale}px`, // Scale the max width
      transform: transform
        ? `translate3d(${transform.x}px, ${transform.y}px, 0)`
        : undefined,
      opacity: isDragging ? 0.4 : 1, // Lower opacity when dragging to show it's being moved
      // Add transition for smooth scaling
      transition: "font-size 0.2s, max-width 0.2s",
      fontSize: `${14 * parentScale}px`, // Scale the font size
    }),
    [
      adjustedPosition.x,
      adjustedPosition.y,
      transform?.x,
      transform?.y,
      isDragging,
      parentScale,
    ]
  );

  // The handle will be the same for all components
  const formHandle = useMemo(
    () => (
      <div
        className="p-2 bg-blue-100 rounded-full cursor-move flex justify-between items-center"
        {...listeners}
        {...attributes}
        suppressHydrationWarning
      >
        {/* <span className="font-medium text-sm">{label}</span> */}
        <FiMove className="w-4 h-4" />
      </div>
    ),
    [attributes, listeners, label]
  );

  // The wrapper for all components - use React.memo to prevent unnecessary re-renders
  const FormElementWrapper = useMemo(() => {
    const Wrapper = React.memo(
      ({ children }: { children: React.ReactNode }) => (
        <div
          ref={(node) => {
            // Combine refs
            setNodeRef(node);
            if (elementRef.current !== node) {
              elementRef.current = node as HTMLDivElement | null;
            }
          }}
          style={style}
          className="mb-4"
          suppressHydrationWarning
        >
          <div className="flex items-end gap-1 justify-between">
            <div style={{ flex: 1 }}>{children}</div>
            <div>{formHandle}</div>
          </div>
        </div>
      )
    );
    Wrapper.displayName = "FormElementWrapper";
    return Wrapper;
  }, [formHandle, setNodeRef, style]);

  // Render different form elements based on type
  switch (type) {
    case "text":
      return (
        <FormElementWrapper>
          <label htmlFor={`${id}-input`}>{label}</label>
          <input
            id={`${id}-input`}
            type="text"
            className="w-full max-w-[200px] px-3 py-2 border border-gray-300 bg-white/90 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder={`กรอก${label.toLowerCase()}`}
          />
        </FormElementWrapper>
      );
    case "name":
      return (
        <FormElementWrapper>
          <label htmlFor={`${id}-input`}>{label}</label>
          <input
            id={`${id}-input`}
            type="text"
            className="w-full max-w-[200px] px-3 py-2 border border-gray-300 bg-white/90 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="กรอกชื่อ-นามสกุล"
          />
        </FormElementWrapper>
      );
    case "email":
      return (
        <FormElementWrapper>
          <label htmlFor={`${id}-input`}>{label}</label>
          <input
            id={`${id}-input`}
            type="email"
            className="w-full max-w-[200px] px-3 py-2 border border-gray-300 bg-white/90 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="example@email.com"
          />
        </FormElementWrapper>
      );
    case "phone":
      return (
        <FormElementWrapper>
          <label htmlFor={`${id}-input`}>{label}</label>
          <input
            id={`${id}-input`}
            type="tel"
            className="w-full max-w-[200px] px-3 py-2 border border-gray-300 bg-white/90 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="0xx-xxx-xxxx"
          />
        </FormElementWrapper>
      );
    case "number":
      return (
        <FormElementWrapper>
          <label htmlFor={`${id}-input`}>{label}</label>
          <input
            id={`${id}-input`}
            type="number"
            className="w-full max-w-[200px] px-3 py-2 border border-gray-300 bg-white/90 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="กรอกตัวเลข"
          />
        </FormElementWrapper>
      );
    case "textarea":
      return (
        <FormElementWrapper>
          <label htmlFor={`${id}-textarea`}>{label}</label>
          <textarea
            id={`${id}-textarea`}
            className="w-full max-w-[200px] px-3 py-2 border border-gray-300 bg-white/90 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            rows={3}
            placeholder="กรอกข้อความที่นี่"
          />
        </FormElementWrapper>
      );
    case "date":
      return (
        <FormElementWrapper>
          <label htmlFor={`${id}-date`}>{label}</label>
          <input
            id={`${id}-date`}
            type="date"
            className="w-full max-w-[200px] px-3 py-2 border border-gray-300 bg-white/90 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            title={label}
            placeholder={`กรอก${label.toLowerCase()}`}
          />
        </FormElementWrapper>
      );
    case "select":
      return (
        <FormElementWrapper>
          <label htmlFor={`${id}-select`}>{label}</label>
          <select
            id={`${id}-select`}
            className="w-full max-w-[200px] px-3 py-2 border border-gray-300 bg-white/90 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            aria-labelledby={`select-label-${id}`}
            title={label}
          >
            <option value="">เลือกตัวเลือก</option>
            <option value="option1">ตัวเลือกที่ 1</option>
            <option value="option2">ตัวเลือกที่ 2</option>
            <option value="option3">ตัวเลือกที่ 3</option>
          </select>
        </FormElementWrapper>
      );
    case "checkbox":
      return (
        <FormElementWrapper>
          <div className="bg-white/90 p-2 rounded-md w-full">
            <label htmlFor={`${id}-checkbox`} className="block mb-2">
              {label}
            </label>
            <CheckboxOptions id={id} />
          </div>
        </FormElementWrapper>
      );
    default:
      return null;
  }
};
