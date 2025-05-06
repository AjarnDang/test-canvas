"use client";

import React, { CSSProperties, useMemo } from "react";
import { useDroppable } from "@dnd-kit/core";
import { useDraggable } from "@dnd-kit/core";
import { FiMove } from "react-icons/fi";

interface FormCanvasProps {
  children: React.ReactNode;
  hasPdfBackground?: boolean;
}

export const FormCanvas: React.FC<FormCanvasProps> = ({
  children,
  hasPdfBackground = false,
}) => {
  const { setNodeRef } = useDroppable({
    id: "form-canvas",
  });

  const canvasClasses = `w-full h-full ${
    hasPdfBackground
      ? "bg-transparent"
      : "bg-white border-2 border-dashed border-gray-300"
  } rounded-lg relative`;

  return (
    <div ref={setNodeRef} className={canvasClasses} suppressHydrationWarning>
      {children}
    </div>
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

  // Use useMemo to create a stable reference for the style object
  const style = useMemo<CSSProperties>(
    () => ({
      position: "absolute",
      top: position?.y || 0,
      left: position?.x || 0,
      zIndex: isDragging ? 1000 : 10, // Higher z-index to ensure visibility over PDF
      width: "calc(100% - 20px)",
      maxWidth: "180px",
      transform: transform
        ? `translate3d(${transform.x}px, ${transform.y}px, 0)`
        : undefined,
      opacity: isDragging ? 0.4 : 1, // Lower opacity when dragging to show it's being moved
    }),
    [position?.x, position?.y, transform?.x, transform?.y, isDragging]
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
          ref={setNodeRef}
          style={style}
          className="mb-4"
          suppressHydrationWarning
        >
          <div className="flex items-end gap-1 justify-between">
            <div>{children}</div>
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
          <div className="bg-white/90 p-2 rounded-md">
            <label htmlFor={`${id}-checkbox`} className="block">
              {label}
            </label>
            <div className="flex items-center w-full">
              <input
                type="checkbox"
                className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                id={`checkbox-${id}`}
                aria-label={label}
                title={label}
              />
              <label htmlFor={`${id}-checkbox`} className="ml-2 w-full min-w-fit">
                {label}
              </label>
            </div>
          </div>
        </FormElementWrapper>
      );
    default:
      return null;
  }
};
