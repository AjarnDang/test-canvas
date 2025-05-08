'use client'

import React, { useState, useEffect, ChangeEvent } from 'react';
import { Input, Typography, Form, InputNumber, Button, Divider } from 'antd';
import { CloseOutlined } from '@ant-design/icons';

// Type for configuration options
export interface FormElementConfigProps {
  id: string;
  type: string;
  label: string;
  checkboxOptions?: string[];
  maxLength?: number;
  required?: boolean;
  placeholder?: string;
  onConfigChange: (config: FormElementConfigData) => void;
  onClose: () => void;
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

const { Title } = Typography;

export const FormElementConfig: React.FC<FormElementConfigProps> = ({
  id,
  type,
  label,
  checkboxOptions = [],
  maxLength,
  required = false,
  placeholder = '',
  onConfigChange,
  onClose,
}) => {
  // Local state for form values
  const [formState, setFormState] = useState<FormElementConfigData>({
    id,
    label,
    checkboxOptions,
    maxLength,
    required,
    placeholder,
  });

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
  // Only update when props actually change, not on every render
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, type]);

  // Handle input changes
  const handleInputChange = (
    e: ChangeEvent<HTMLInputElement> | number | boolean,
    field: string
  ) => {
    const newValue = typeof e === 'object' ? e.target.value : e;
    
    setFormState(prev => ({
      ...prev,
      [field]: newValue
    }));
  };

  // Handle checkbox option changes
  const handleCheckboxOptionChange = (index: number, newValue: string) => {
    const updatedOptions = [...(formState.checkboxOptions || [])];
    updatedOptions[index] = newValue;
    
    setFormState(prev => ({
      ...prev,
      checkboxOptions: updatedOptions
    }));
  };

  // Add new checkbox option
  const addCheckboxOption = () => {
    const updatedOptions = [
      ...(formState.checkboxOptions || []),
      `ตัวเลือกที่ ${(formState.checkboxOptions?.length || 0) + 1}`
    ];
    
    setFormState(prev => ({
      ...prev,
      checkboxOptions: updatedOptions
    }));
  };

  // Remove checkbox option
  const removeCheckboxOption = (index: number) => {
    const updatedOptions = [...(formState.checkboxOptions || [])];
    updatedOptions.splice(index, 1);
    
    setFormState(prev => ({
      ...prev,
      checkboxOptions: updatedOptions
    }));
  };

  // Save configuration
  const saveConfig = () => {
    onConfigChange(formState);
  };

  // Get type-specific configuration options
  const renderTypeSpecificOptions = () => {
    switch (type) {
      case 'text':
      case 'name':
      case 'email':
      case 'phone':
        return (
          <>
            <Form.Item label="ความยาวสูงสุด">
              <InputNumber
                min={1}
                max={1000}
                value={formState.maxLength}
                onChange={(value) => handleInputChange(value as number, 'maxLength')}
              />
            </Form.Item>
            <Form.Item label="ข้อความตัวอย่าง">
              <Input
                value={formState.placeholder}
                onChange={(e) => handleInputChange(e, 'placeholder')}
                placeholder="ข้อความตัวอย่าง"
              />
            </Form.Item>
          </>
        );
      
      case 'checkbox':
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
                    onChange={(e) => handleCheckboxOptionChange(index, e.target.value)}
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
      
      case 'textarea':
        return (
          <>
            <Form.Item label="ความยาวสูงสุด">
              <InputNumber
                min={1}
                max={5000}
                value={formState.maxLength}
                onChange={(value) => handleInputChange(value as number, 'maxLength')}
              />
            </Form.Item>
            <Form.Item label="ข้อความตัวอย่าง">
              <Input
                value={formState.placeholder}
                onChange={(e) => handleInputChange(e, 'placeholder')}
                placeholder="ข้อความตัวอย่าง"
              />
            </Form.Item>
          </>
        );
      
      case 'select':
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
                    onChange={(e) => handleCheckboxOptionChange(index, e.target.value)}
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

  return (
    <div className="bg-white rounded-lg shadow-md p-4 max-w-md z-10">
      <div className="flex justify-between items-center mb-4">
        <Title level={4}>ตั้งค่า {label}</Title>
        <Button type="text" icon={<CloseOutlined />} onClick={onClose} />
      </div>
      
      <p>{formState.id}</p>
      <Form layout="vertical">
        <Form.Item label="ป้ายกำกับ (Label)">
          <Input
            value={formState.label}
            onChange={(e) => handleInputChange(e, 'label')}
            placeholder="ป้ายกำกับ"
          />
        </Form.Item>
        
        <Form.Item>
          <div className="flex items-center">
            <Form.Item name="required" valuePropName="checked" noStyle>
              <input 
                type="checkbox" 
                checked={formState.required}
                onChange={(e) => handleInputChange(e.target.checked, 'required')}
                className="mr-2"
                aria-label="บังคับกรอก"
                title="บังคับกรอก"
              />
            </Form.Item>
            <span>บังคับกรอก</span>
          </div>
        </Form.Item>
        
        {renderTypeSpecificOptions()}

      </Form>
      
      <Divider />
      
      <div className="flex justify-end">
        <Button onClick={onClose} className="mr-2">
          ยกเลิก
        </Button>
        <Button type="primary" onClick={saveConfig}>
          บันทึก
        </Button>
      </div>
    </div>
  );
}; 