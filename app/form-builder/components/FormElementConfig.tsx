"use client";

import React, { useState, useEffect, ChangeEvent } from "react";
import { Input, Form, InputNumber, Button, Divider } from "antd";
import { CloseOutlined, DeleteOutlined } from "@ant-design/icons";

// Type for configuration options
export interface FormElementConfigProps {
  id: string;
  type: string;
  label: string;
  checkboxOptions?: string[];
  maxLength?: number;
  required?: boolean;
  placeholder?: string;
  value?: string | string[] | boolean | number;
  onConfigChange: (config: FormElementConfigData) => void;
  onValueChange?: (
    value: string | string[] | boolean | number,
    checkboxOptions?: string[]
  ) => void;
  onClose: () => void;
  onDelete?: () => void;
}

// Config data that gets passed back to the parent
export interface FormElementConfigData {
  id: string;
  label: string;
  checkboxOptions?: string[];
  maxLength?: number;
  required?: boolean;
  placeholder?: string;
}

export const FormElementConfig: React.FC<FormElementConfigProps> = ({
  id,
  type,
  label,
  checkboxOptions = [],
  maxLength,
  required = false,
  placeholder = "",
  value,
  onConfigChange,
  onValueChange,
  onClose,
  onDelete,
}): React.ReactElement => {
  // Local state for form values
  const [formState, setFormState] = useState<FormElementConfigData>({
    id,
    label,
    checkboxOptions,
    maxLength,
    required,
    placeholder,
  });

  // Local state เพื่อเก็บค่า value ปัจจุบัน
  const [localValue, setLocalValue] = useState<
    string | string[] | boolean | number | undefined
  >(value);

  // Update local state when props change
  useEffect(() => {
    setFormState({
      id,
      label,
      checkboxOptions,
      maxLength,
      required,
      placeholder,
    });
    setLocalValue(value);
    // Only update when props actually change, not on every render
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, type, value]);

  // Handle input changes
  const handleInputChange = (
    e: ChangeEvent<HTMLInputElement> | number | boolean,
    field: string
  ) => {
    const newValue = typeof e === "object" ? e.target.value : e;

    setFormState((prev) => ({
      ...prev,
      [field]: newValue,
    }));
  };

  // Handle checkbox option changes
  const handleCheckboxOptionChange = (index: number, newValue: string) => {
    const updatedOptions = [...(formState.checkboxOptions || [])];
    updatedOptions[index] = newValue;

    setFormState((prev) => ({
      ...prev,
      checkboxOptions: updatedOptions,
    }));
  };

  // Add new checkbox option
  const addCheckboxOption = () => {
    const updatedOptions = [
      ...(formState.checkboxOptions || []),
      `ตัวเลือกที่ ${(formState.checkboxOptions?.length || 0) + 1}`,
    ];

    setFormState((prev) => ({
      ...prev,
      checkboxOptions: updatedOptions,
    }));
  };

  // Remove checkbox option
  const removeCheckboxOption = (index: number) => {
    const updatedOptions = [...(formState.checkboxOptions || [])];
    updatedOptions.splice(index, 1);

    setFormState((prev) => ({
      ...prev,
      checkboxOptions: updatedOptions,
    }));
  };

  // Save configuration
  const saveConfig = () => {
    onConfigChange(formState);
  };

  // ฟังก์ชันสำหรับอัปเดตค่า
  const handleValueChange = (
    newValue: string | string[] | boolean | number,
    index?: number
  ) => {
    if (index !== undefined && Array.isArray(localValue)) {
      // กรณีเป็น array เช่น checkbox options
      const newArray = [...localValue];
      newArray[index] = newValue as string;
      setLocalValue(newArray);
      if (onValueChange) {
        onValueChange(newArray, formState.checkboxOptions);
      }
    } else {
      // กรณีเป็นค่าเดี่ยวๆ
      setLocalValue(newValue);
      if (onValueChange) {
        onValueChange(newValue, formState.checkboxOptions);
      }
    }
  };

  // Get type-specific configuration options
  const renderTypeSpecificOptions = () => {
    switch (type) {
      case "text":
      case "name":
      case "email":
      case "phone":
        return (
          <>
            <Form.Item label="ความยาวสูงสุด">
              <InputNumber
                min={1}
                max={1000}
                value={formState.maxLength}
                onChange={(value) =>
                  handleInputChange(value as number, "maxLength")
                }
              />
            </Form.Item>
            <Form.Item label="ข้อความตัวอย่าง">
              <Input
                value={formState.placeholder}
                onChange={(e) => handleInputChange(e, "placeholder")}
                placeholder="ข้อความตัวอย่าง"
              />
            </Form.Item>
          </>
        );

      case "checkbox":
        return (
          <>
            <div className="mb-4">
              <div className="flex justify-between items-center mb-2">
                <label className="font-medium">ตัวเลือก</label>
                <Button type="primary" size="small" onClick={addCheckboxOption}>
                  เพิ่มตัวเลือก
                </Button>
              </div>

              {formState.checkboxOptions?.map((option, index) => (
                <div key={index} className="flex items-center mb-2">
                  <Input
                    value={option}
                    onChange={(e) =>
                      handleCheckboxOptionChange(index, e.target.value)
                    }
                    className="mr-2"
                  />
                  <Button
                    type="text"
                    danger
                    icon={<CloseOutlined />}
                    onClick={() => removeCheckboxOption(index)}
                    disabled={formState.checkboxOptions?.length === 1}
                  />
                </div>
              ))}
            </div>
          </>
        );

      case "textarea":
        return (
          <>
            <Form.Item label="ความยาวสูงสุด">
              <InputNumber
                min={1}
                max={5000}
                value={formState.maxLength}
                onChange={(value) =>
                  handleInputChange(value as number, "maxLength")
                }
              />
            </Form.Item>
            <Form.Item label="ข้อความตัวอย่าง">
              <Input
                value={formState.placeholder}
                onChange={(e) => handleInputChange(e, "placeholder")}
                placeholder="ข้อความตัวอย่าง"
              />
            </Form.Item>
          </>
        );

      case "select":
        return (
          <>
            <div className="mb-4">
              <div className="flex justify-between items-center mb-2">
                <label className="font-medium">ตัวเลือก</label>
                <Button type="primary" size="small" onClick={addCheckboxOption}>
                  เพิ่มตัวเลือก
                </Button>
              </div>

              {formState.checkboxOptions?.map((option, index) => (
                <div key={index} className="flex items-center mb-2">
                  <Input
                    value={option}
                    onChange={(e) =>
                      handleCheckboxOptionChange(index, e.target.value)
                    }
                    className="mr-2"
                  />
                  <Button
                    type="text"
                    danger
                    icon={<CloseOutlined />}
                    onClick={() => removeCheckboxOption(index)}
                    disabled={formState.checkboxOptions?.length === 1}
                  />
                </div>
              ))}
            </div>
          </>
        );

      default:
        return null;
    }
  };

  // ฟังก์ชันแสดงค่า value ตามประเภทของ element
  const renderCurrentValue = () => {
    if (localValue === undefined || localValue === null) return null;

    switch (type) {
      case "text":
      case "name":
      case "email":
      case "phone":
        return (
          <Form.Item label="ค่าปัจจุบัน">
            <Input
              value={localValue as string}
              className="w-full"
              onChange={(e) => handleValueChange(e.target.value)}
              placeholder={`กรอก${label.toLowerCase()}`}
            />
          </Form.Item>
        );

      case "number":
        return (
          <Form.Item label="ค่าปัจจุบัน">
            <InputNumber
              value={localValue as number}
              className="w-full"
              onChange={(value) => handleValueChange(value as number)}
              placeholder="กรอกตัวเลข"
            />
          </Form.Item>
        );

      case "date":
        return (
          <Form.Item label="ค่าปัจจุบัน">
            <Input
              type="date"
              value={localValue as string}
              className="w-full"
              onChange={(e) => handleValueChange(e.target.value)}
            />
          </Form.Item>
        );

      case "textarea":
        return (
          <Form.Item label="ค่าปัจจุบัน">
            <Input.TextArea
              value={localValue as string}
              className="w-full"
              rows={3}
              onChange={(e) => handleValueChange(e.target.value)}
              placeholder={`กรอก${label.toLowerCase()}`}
            />
          </Form.Item>
        );

      case "select":
        return (
          <Form.Item label="ค่าปัจจุบัน">
            <select
              value={localValue as string}
              className="w-full border border-gray-300 p-2 rounded"
              onChange={(e) => handleValueChange(e.target.value)}
              title={`เลือก${label}`}
              aria-label={`เลือก${label}`}
            >
              <option value="">เลือกตัวเลือก</option>
              {formState.checkboxOptions?.map((option, index) => (
                <option key={index} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </Form.Item>
        );

      case "checkbox":
        if (Array.isArray(localValue)) {
          return (
            <Form.Item label="ตัวเลือกที่เลือกไว้">
              <div>
                {formState.checkboxOptions?.map((option, index) => (
                  <div key={index} className="py-1 flex items-center">
                    <input
                      type="checkbox"
                      checked={localValue.includes(option)}
                      onChange={(e) => {
                        const newValues = e.target.checked
                          ? [...localValue, option]
                          : localValue.filter((val) => val !== option);
                        handleValueChange(newValues);
                      }}
                      className="mr-2"
                      title={option}
                      aria-label={option}
                    />
                    <span>{option}</span>
                  </div>
                ))}
              </div>
            </Form.Item>
          );
        }
        return null;

      default:
        return null;
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-4 max-w-md z-10">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-lg font-bold">ตั้งค่า {label}</h1>
        <button
          type="button"
          onClick={onClose}
          className="text-gray-500 text-xs cursor-pointer"
        >
          <CloseOutlined />
        </button>
      </div>

      <h5 className="text-gray-500 text-xs mb-4">{formState.id}</h5>
      <Form layout="vertical" className="w-full">
        <Form.Item label="ป้ายกำกับ (Label)">
          <Input
            value={formState.label}
            onChange={(e) => handleInputChange(e, "label")}
            placeholder="ป้ายกำกับ"
            className="w-full"
            size="large"
          />
        </Form.Item>

        <Form.Item>
          <div className="flex items-center">
            <Form.Item name="required" valuePropName="checked" noStyle>
              <input
                type="checkbox"
                checked={formState.required}
                onChange={(e) =>
                  handleInputChange(e.target.checked, "required")
                }
                className="mr-2"
                aria-label="บังคับกรอก"
                title="บังคับกรอก"
              />
            </Form.Item>
            <span>บังคับกรอก</span>
          </div>
        </Form.Item>

        {/* แสดงค่า value ปัจจุบัน */}
        {renderCurrentValue()}

        {renderTypeSpecificOptions()}
      </Form>

      <Divider />

      <div className="flex justify-between">
        {onDelete && (
          <Button
            danger
            type="primary"
            icon={<DeleteOutlined />}
            onClick={onDelete}
          >
            ลบรายการนี้
          </Button>
        )}
        <div className="flex justify-end">
          <Button onClick={onClose} className="mr-2">
            ยกเลิก
          </Button>
          <Button type="primary" onClick={saveConfig}>
            บันทึก
          </Button>
        </div>
      </div>
    </div>
  );
};
