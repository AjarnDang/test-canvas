/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import React from "react";
import { useDraggable } from "@dnd-kit/core";
import {
  FileTextOutlined,
  UserOutlined,
  NumberOutlined,
  FormOutlined,
  CheckOutlined,
  CalendarOutlined,
  PictureOutlined,
  MailOutlined,
  PhoneOutlined,
} from "@ant-design/icons";

interface FormElementProps {
  id: string;
  type: string;
  label: string;
}

export const FormElement: React.FC<FormElementProps> = ({
  id,
  type,
  label,
}) => {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id,
  });

  const style = transform
    ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
      }
    : undefined;

  // เลือกไอคอนตามประเภทของ element
  const getIcon = () => {
    switch (type) {
      case "text":
        return <FileTextOutlined />;
      case "name":
        return <UserOutlined />;
      case "number":
        return <NumberOutlined />;
      case "textarea":
        return <FormOutlined />;
      case "checkbox":
        return <CheckOutlined />;
      case "select":
        return <FormOutlined />;
      case "date":
        return <CalendarOutlined />;
      case "image":
        return <PictureOutlined />;
      case "email":
        return <MailOutlined />;
      case "phone":
        return <PhoneOutlined />;
      default:
        return <FileTextOutlined />;
    }
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className="p-2 mb-2 bg-gray-100 border border-gray-300 rounded cursor-move hover:bg-gray-200 flex items-center"
    >
      <span className="mr-2 text-blue-500">{getIcon()}</span>
      {label}
    </div>
  );
};

export const formElements = [
  {
    id: "text-input",
    type: "text",
    label: "ข้อความ",
  },
  {
    id: "name-input",
    type: "name",
    label: "ชื่อ-นามสกุล",
  },
  {
    id: "email-input",
    type: "email",
    label: "อีเมล",
  },
  {
    id: "phone-input",
    type: "phone",
    label: "เบอร์โทรศัพท์",
  },
  {
    id: "number-input",
    type: "number",
    label: "ตัวเลข",
  },
  {
    id: "textarea",
    type: "textarea",
    label: "ข้อความหลายบรรทัด",
  },
  {
    id: "select",
    type: "select",
    label: "เลือกตัวเลือก",
  },
  {
    id: "checkbox",
    type: "checkbox",
    label: "ช่องทำเครื่องหมาย",
  },
  {
    id: "date",
    type: "date",
    label: "วันที่",
  },
];
