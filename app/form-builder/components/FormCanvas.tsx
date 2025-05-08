"use client";

import React, {
  CSSProperties,
  useMemo,
  useState,
  useEffect,
  useRef,
  ChangeEvent,
} from "react";
import { useDroppable } from "@dnd-kit/core";
import { useDraggable } from "@dnd-kit/core";
import { FiMove, FiSettings } from "react-icons/fi";
import { FormElementConfig, FormElementConfigData } from "./FormElementConfig";

interface FormCanvasProps {
  children: React.ReactNode;
  hasPdfBackground?: boolean;
  pdfDimensions?: { width: number; height: number };
  scale?: number;
}

// Convert to forwardRef to allow parent components to access the DOM element
export const FormCanvas = React.forwardRef<HTMLDivElement, FormCanvasProps>(
  ({ children, hasPdfBackground = false, pdfDimensions, scale = 1 }, ref) => {
    const { setNodeRef } = useDroppable({
      id: "form-canvas",
    });

    const canvasRef = useRef<HTMLDivElement>(null);
    const pdfAreaRef = useRef<HTMLDivElement>(null);
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
          const pdfPage = document.querySelector(".react-pdf__Page");
          const canvasContainer = canvasRef.current.parentElement;

          if (!canvasContainer) return;

          // Get container dimensions - this is where our PDF and form elements will sit
          const containerRect = canvasContainer.getBoundingClientRect();

          if (pdfPage && pdfDimensions) {
            // Get the actual rendered PDF dimensions
            const pdfRect = pdfPage.getBoundingClientRect();

            // We'll use the PDF's actual size as rendered, which already has scale applied
            // This is important for maintaining correct form element positioning
            const scaledWidth = pdfRect.width;
            const scaledHeight = pdfRect.height;

            // Calculate left position to center the PDF
            const left = Math.max(0, (containerRect.width - scaledWidth) / 2);

            // Set PDF rect to match the actual PDF
            setPdfRect({
              width: scaledWidth,
              height: scaledHeight,
              top: 0, // Top aligned for scrolling
              left: left,
            });

            // We'll use the current scale as is
            setCanvasScale(scale);
          } else if (pdfDimensions) {
            // If we have PDF dimensions but no element yet

            // Calculate scaled dimensions based on current scale
            const scaledWidth = pdfDimensions.width * scale;
            const scaledHeight = pdfDimensions.height * scale;

            // Calculate left position to center the PDF
            const left = Math.max(0, (containerRect.width - scaledWidth) / 2);

            // Set PDF rect
            setPdfRect({
              width: scaledWidth,
              height: scaledHeight,
              top: 0,
              left: left,
            });

            setCanvasScale(scale);
          } else {
            // Fallback if no PDF dimensions available
            setCanvasScale(scale);
          }
        }
      };

      // Call handleResize immediately
      handleResize();

      // Create a MutationObserver to detect when the PDF is rendered
      const observer = new MutationObserver((mutations) => {
        const pdfPageRendered = mutations.some((mutation) =>
          Array.from(mutation.addedNodes).some(
            (node) =>
              node instanceof Element &&
              node.classList.contains("react-pdf__Page")
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

      // Update form canvas when scale changes
      const scaleObserver = new MutationObserver(() => {
        handleResize();
      });

      // Observe the container for size changes (like when scale changes)
      if (canvasRef.current && canvasRef.current.parentElement) {
        scaleObserver.observe(canvasRef.current.parentElement, {
          attributes: true,
          attributeFilter: ["style"],
        });
      }

      return () => {
        observer.disconnect();
        scaleObserver.disconnect();
        window.removeEventListener("resize", handleResize);
        window.removeEventListener("orientationchange", handleResize);
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

    // Effect to forward the PDF area ref to the parent component
    useEffect(() => {
      if (typeof ref === "function") {
        ref(pdfAreaRef.current);
      } else if (ref) {
        ref.current = pdfAreaRef.current;
      }
    }, [ref, pdfAreaRef.current]);

    return (
      <div
        ref={(node) => {
          // Combine refs
          setNodeRef(node);

          // Update our local ref
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
            ref={pdfAreaRef}
            className="pdf-form-area"
            style={pdfAreaStyle}
            data-pdf-width={pdfRect.width}
            data-pdf-height={pdfRect.height}
            data-scale={scale}
          >
            {children}
          </div>
        ) : (
          children
        )}
      </div>
    );
  }
);

// Add display name
FormCanvas.displayName = "FormCanvas";

// CheckboxOptions component for handling checkbox options with add/remove functionality
const CheckboxOptions: React.FC<{
  id: string;
  initialValue?: string[];
  initialOptions?: string[];
  onChange?: (values: string[], options?: string[]) => void;
}> = ({ id, initialValue = [], initialOptions, onChange }) => {
  // Initialize with default or provided options
  const [options, setOptions] = useState(
    initialOptions || ["ตัวเลือกที่ 1", "ตัวเลือกที่ 2", "ตัวเลือกที่ 3"]
  );

  // Track checked values
  const [checkedValues, setCheckedValues] = useState<string[]>(
    initialValue || []
  );

  // When initialValue or initialOptions change, update local state
  useEffect(() => {
    setCheckedValues(initialValue || []);
  }, [initialValue]);

  useEffect(() => {
    if (initialOptions && initialOptions.length > 0) {
      setOptions(initialOptions);
    }
  }, [initialOptions]);

  const addOption = () => {
    const newOptions = [...options, `ตัวเลือกที่ ${options.length + 1}`];
    setOptions(newOptions);
    // Notify parent about options change
    if (onChange) {
      onChange(checkedValues, newOptions);
    }
  };

  const removeOption = (index: number) => {
    const newOptions = options.filter((_, i) => i !== index);

    // Also remove from checked values if it was checked
    const removedOption = options[index];
    let newCheckedValues = [...checkedValues];

    if (checkedValues.includes(removedOption)) {
      newCheckedValues = checkedValues.filter((v) => v !== removedOption);
      setCheckedValues(newCheckedValues);
    }

    setOptions(newOptions);

    // Notify parent with updated options and checked values
    if (onChange) {
      onChange(newCheckedValues, newOptions);
    }
  };

  const handleCheckboxChange = (
    e: ChangeEvent<HTMLInputElement>,
    option: string
  ) => {
    const isChecked = e.target.checked;
    let newCheckedValues: string[];

    if (isChecked) {
      newCheckedValues = [...checkedValues, option];
    } else {
      newCheckedValues = checkedValues.filter((v) => v !== option);
    }

    setCheckedValues(newCheckedValues);

    // Notify parent with updated checked values and current options
    if (onChange) {
      onChange(newCheckedValues, options);
    }
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
            checked={checkedValues.includes(option)}
            onChange={(e) => handleCheckboxChange(e, option)}
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
  value?: string | string[] | boolean | number;
  checkboxOptions?: string[];
  maxLength?: number;
  required?: boolean;
  placeholder?: string;
  onValueChange?: (
    value: string | string[] | boolean | number,
    checkboxOptions?: string[]
  ) => void;
  onConfigChange?: (config: FormElementConfigData) => void;
  onConfigClick?: () => void;
}> = ({
  id,
  type,
  label,
  position,
  value,
  checkboxOptions,
  maxLength,
  required = false,
  placeholder = "",
  onValueChange,
  onConfigChange,
  onConfigClick,
}) => {
  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({
      id: `dropped-${id}`,
    });

  const [parentScale, setParentScale] = useState(1);
  const [pdfDimensions, setPdfDimensions] = useState<{
    width: number;
    height: number;
  } | null>(null);
  const [scrollOffset, setScrollOffset] = useState(0);
  const elementRef = useRef<HTMLDivElement>(null);
  const [showConfig, setShowConfig] = useState(false);

  // Local state for input values to prevent cursor jumping
  const [localValue, setLocalValue] = useState<
    string | string[] | boolean | number | undefined
  >(value);
  // Local state for checkbox options
  const [localCheckboxOptions, setLocalCheckboxOptions] = useState<
    string[] | undefined
  >(checkboxOptions);

  // Update local value when prop value changes (from parent)
  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  // Update local checkbox options when prop changes
  useEffect(() => {
    setLocalCheckboxOptions(checkboxOptions);
  }, [checkboxOptions]);

  // Track scroll position to adjust elements when page scrolls
  useEffect(() => {
    const handleScroll = () => {
      setScrollOffset(window.scrollY);
    };

    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

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

  // Added to monitor and debug position rendering
  const [renderCount, setRenderCount] = useState(0);

  // Increment render count on each render to help debug
  useEffect(() => {
    setRenderCount((prev) => prev + 1);
  }, []);

  // Adjust position based on parent scale and constrain to PDF area
  const adjustedPosition = useMemo(() => {
    if (!position) return { x: 0, y: 0 };

    // These are the raw coordinates from the stored position
    // They are in unscaled coordinates (as if scale = 1)
    let posX = position.x;
    let posY = position.y;

    // Constrain to PDF dimensions if available
    if (pdfDimensions) {
      // Different constraints based on element type
      const elementWidth = type === "checkbox" ? 240 : 180;
      const elementHeight = type === "checkbox" ? 150 : 50;

      // Ensure element stays within bounds
      posX = Math.max(
        0,
        Math.min(posX, pdfDimensions.width / parentScale - elementWidth)
      );
      posY = Math.max(
        0,
        Math.min(posY, pdfDimensions.height / parentScale - elementHeight)
      );
    }

    return { x: posX, y: posY };
  }, [
    position?.x,
    position?.y,
    pdfDimensions,
    type,
    parentScale,
    id,
    renderCount,
  ]);

  // Handle local input value changes
  const handleLocalInputChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setLocalValue(e.target.value);
  };

  // Send value to parent on blur or enter key
  const handleInputBlur = () => {
    if (onValueChange && localValue !== value) {
      onValueChange(
        localValue as string | string[] | boolean | number,
        localCheckboxOptions
      );
    }
  };

  const handleKeyDown = (
    e: React.KeyboardEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    if (e.key === "Enter") {
      e.currentTarget.blur(); // Blur the input to trigger onBlur
    }
  };

  // Handle configuration changes
  const handleConfigChange = (config: FormElementConfigData) => {
    setShowConfig(false);
    if (onConfigChange) {
      onConfigChange(config);
    }
  };

  // Close config modal
  const handleCloseConfig = () => {
    setShowConfig(false);
  };

  // Use useMemo to create a stable reference for the style object
  const style = useMemo<CSSProperties>(() => {
    return {
      position: "absolute",
      top: adjustedPosition.y * parentScale,
      left: adjustedPosition.x * parentScale,
      zIndex: isDragging ? 1000 : 20, // Higher z-index to ensure visibility over PDF
      // For checkbox, textarea and dropdown, we should use fit-content
      width: type === "checkbox" ? "fit-content" : "calc(100% - 20px)",
      maxWidth: type === "checkbox" ? "280px" : `${180 * parentScale}px`, // Scale the max width
      transform: transform
        ? `translate3d(${transform.x}px, ${transform.y}px, 0)`
        : undefined,
      opacity: isDragging ? 0.4 : 1, // Lower opacity when dragging to show it's being moved
      // Add transition for smooth scaling
      transition: "font-size 0.2s, max-width 0.2s",
      fontSize: `${14 * parentScale}px`, // Scale the font size
    };
  }, [
    adjustedPosition.x,
    adjustedPosition.y,
    transform?.x,
    transform?.y,
    isDragging,
    parentScale,
    scrollOffset,
    type,
    id,
    renderCount,
  ]);

  // Add delete button to the formHandle
  const formHandle = useMemo(
    () => (
      <div className="flex items-center">
        <button
          type="button"
          onClick={onConfigClick || (() => setShowConfig(true))}
          className="p-2 bg-blue-100 rounded-full hover:bg-blue-200 text-blue-600 mr-1"
          title="ตั้งค่า"
        >
          <FiSettings className="w-4 h-4" />
        </button>
        <div
          className="p-2 bg-blue-100 rounded-full cursor-move flex justify-between items-center"
          {...listeners}
          {...attributes}
          suppressHydrationWarning
        >
          <FiMove className="w-4 h-4" />
        </div>
      </div>
    ),
    [attributes, listeners, onConfigClick]
  );

  // The wrapper for all components - use React.memo to prevent unnecessary re-renders
  const FormElementWrapper = useMemo(() => {
    const Wrapper = React.memo(
      ({ children }: { children: React.ReactNode }) => (
        <>
          <div
            ref={(node) => {
              // Combine refs
              setNodeRef(node);
              if (elementRef.current !== node) {
                elementRef.current = node as HTMLDivElement | null;
              }
            }}
            style={style}
            className="min-w-[200px] w-full"
            suppressHydrationWarning
          >
            <div className="flex items-end gap-1 justify-between">
              <div style={{ flex: 1 }}>{children}</div>
              <div>{formHandle}</div>
            </div>
          </div>

          {showConfig && (
            <div className="fixed top-1/2 right-0 -translate-y-1/2 z-50">
              <FormElementConfig
                id={id}
                type={type}
                label={label}
                checkboxOptions={checkboxOptions}
                maxLength={maxLength}
                required={required}
                placeholder={placeholder}
                onConfigChange={handleConfigChange}
                onClose={handleCloseConfig}
              />
            </div>
          )}
        </>
      )
    );
    Wrapper.displayName = "FormElementWrapper";
    return Wrapper;
  }, [
    formHandle,
    setNodeRef,
    style,
    showConfig,
    id,
    type,
    label,
    value,
    checkboxOptions,
    maxLength,
    required,
    placeholder,
  ]);

  // Render different form elements based on type
  switch (type) {
    case "text":
      return (
        <FormElementWrapper>
          <label htmlFor={`${id}-input`} className="flex items-center">
            {label}
            {required && <span className="text-red-500 ml-1">*</span>}
          </label>
          <input
            id={`${id}-input`}
            type="text"
            className="w-full max-w-[200px] px-3 py-2 border border-gray-300 bg-white/90 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder={placeholder || `กรอก${label.toLowerCase()}`}
            value={(localValue as string) || ""}
            onChange={handleLocalInputChange}
            onBlur={handleInputBlur}
            onKeyDown={handleKeyDown}
            maxLength={maxLength}
            required={required}
          />
        </FormElementWrapper>
      );
    case "name":
      return (
        <FormElementWrapper>
          <label htmlFor={`${id}-input`} className="flex items-center">
            {label}
            {required && <span className="text-red-500 ml-1">*</span>}
          </label>
          <input
            id={`${id}-input`}
            type="text"
            className="w-full max-w-[200px] px-3 py-2 border border-gray-300 bg-white/90 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder={placeholder || "กรอกชื่อ-นามสกุล"}
            value={(localValue as string) || ""}
            onChange={handleLocalInputChange}
            onBlur={handleInputBlur}
            onKeyDown={handleKeyDown}
            maxLength={maxLength}
            required={required}
          />
        </FormElementWrapper>
      );
    case "email":
      return (
        <FormElementWrapper>
          <label htmlFor={`${id}-input`} className="flex items-center">
            {label}
            {required && <span className="text-red-500 ml-1">*</span>}
          </label>
          <input
            id={`${id}-input`}
            type="email"
            className="w-full max-w-[200px] px-3 py-2 border border-gray-300 bg-white/90 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder={placeholder || "example@email.com"}
            value={(localValue as string) || ""}
            onChange={handleLocalInputChange}
            onBlur={handleInputBlur}
            onKeyDown={handleKeyDown}
            maxLength={maxLength}
            required={required}
          />
        </FormElementWrapper>
      );
    case "phone":
      return (
        <FormElementWrapper>
          <label htmlFor={`${id}-input`} className="flex items-center">
            {label}
            {required && <span className="text-red-500 ml-1">*</span>}
          </label>
          <input
            id={`${id}-input`}
            type="tel"
            className="w-full max-w-[200px] px-3 py-2 border border-gray-300 bg-white/90 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder={placeholder || "0xx-xxx-xxxx"}
            value={(localValue as string) || ""}
            onChange={handleLocalInputChange}
            onBlur={handleInputBlur}
            onKeyDown={handleKeyDown}
            maxLength={maxLength}
            required={required}
          />
        </FormElementWrapper>
      );
    case "number":
      return (
        <FormElementWrapper>
          <label htmlFor={`${id}-input`} className="flex items-center">
            {label}
            {required && <span className="text-red-500 ml-1">*</span>}
          </label>
          <input
            id={`${id}-input`}
            type="number"
            className="w-full max-w-[200px] px-3 py-2 border border-gray-300 bg-white/90 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder={placeholder || "กรอกตัวเลข"}
            value={(localValue as number) ?? ""}
            onChange={handleLocalInputChange}
            onBlur={handleInputBlur}
            onKeyDown={handleKeyDown}
            required={required}
          />
        </FormElementWrapper>
      );
    case "textarea":
      return (
        <FormElementWrapper>
          <label htmlFor={`${id}-textarea`} className="flex items-center">
            {label}
            {required && <span className="text-red-500 ml-1">*</span>}
          </label>
          <textarea
            id={`${id}-textarea`}
            className="w-full max-w-[200px] px-3 py-2 border border-gray-300 bg-white/90 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            rows={3}
            placeholder={placeholder || "กรอกข้อความที่นี่"}
            value={(localValue as string) || ""}
            onChange={handleLocalInputChange}
            onBlur={handleInputBlur}
            onKeyDown={handleKeyDown}
            maxLength={maxLength}
            required={required}
          />
        </FormElementWrapper>
      );
    case "date":
      return (
        <FormElementWrapper>
          <label htmlFor={`${id}-date`} className="flex items-center">
            {label}
            {required && <span className="text-red-500 ml-1">*</span>}
          </label>
          <input
            id={`${id}-date`}
            type="date"
            className="w-full max-w-[200px] px-3 py-2 border border-gray-300 bg-white/90 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            title={label}
            placeholder={placeholder || `กรอก${label.toLowerCase()}`}
            value={(localValue as string) || ""}
            onChange={handleLocalInputChange}
            onBlur={handleInputBlur}
            onKeyDown={handleKeyDown}
            required={required}
          />
        </FormElementWrapper>
      );
    case "select":
      return (
        <FormElementWrapper>
          <label htmlFor={`${id}-select`} className="flex items-center">
            {label}
            {required && <span className="text-red-500 ml-1">*</span>}
          </label>
          <select
            id={`${id}-select`}
            className="w-full max-w-[200px] px-3 py-2 border border-gray-300 bg-white/90 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            aria-labelledby={`select-label-${id}`}
            title={label}
            value={(localValue as string) || ""}
            onChange={handleLocalInputChange}
            onBlur={handleInputBlur}
            required={required}
          >
            <option value="">{placeholder || "เลือกตัวเลือก"}</option>
            {localCheckboxOptions?.map((option, index) => (
              <option key={index} value={option}>
                {option}
              </option>
            )) || (
              <>
                <option value="option1">ตัวเลือกที่ 1</option>
                <option value="option2">ตัวเลือกที่ 2</option>
                <option value="option3">ตัวเลือกที่ 3</option>
              </>
            )}
          </select>
        </FormElementWrapper>
      );
    case "checkbox":
      return (
        <FormElementWrapper>
          <div className="bg-white/90 p-2 rounded-md w-full">
            <label
              htmlFor={`${id}-checkbox`}
              className="block mb-2 flex items-center"
            >
              {label}
              {required && <span className="text-red-500 ml-1">*</span>}
            </label>
            <CheckboxOptions
              id={id}
              initialValue={Array.isArray(localValue) ? localValue : []}
              initialOptions={localCheckboxOptions}
              onChange={(newValues, newOptions) => {
                setLocalValue(newValues);
                if (newOptions) {
                  setLocalCheckboxOptions(newOptions);
                }

                // Only update parent when there are changes
                if (
                  onValueChange &&
                  (JSON.stringify(newValues) !== JSON.stringify(value) ||
                    JSON.stringify(newOptions) !==
                      JSON.stringify(checkboxOptions))
                ) {
                  onValueChange(newValues, newOptions);
                }
              }}
            />
          </div>
        </FormElementWrapper>
      );
    default:
      return null;
  }
};
