'use client'

import React from 'react';
import { FormElement, formElements } from './FormElements';
import { Button, Divider } from 'antd';
import { SaveOutlined, HomeOutlined } from '@ant-design/icons';
import Link from 'next/link';

export const FormSidebar: React.FC = () => {
  return (
    <div className="w-64 p-4 bg-gray-50 border-r border-gray-200">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold">องค์ประกอบฟอร์ม</h2>
        <Link href="/">
          <Button icon={<HomeOutlined />} size="small">
            หน้าแรก
          </Button>
        </Link>
      </div>
      
      <p className="text-gray-500 text-sm mb-4">
        ลากองค์ประกอบที่ต้องการไปวางใน Form Builder
      </p>
      
      <div>
        {formElements.map((element) => (
          <FormElement 
            key={element.id} 
            id={element.id} 
            type={element.type} 
            label={element.label} 
          />
        ))}
      </div>
      
      <Divider />
      
      <div className="mt-4">
        <Button type="primary" icon={<SaveOutlined />} block>
          บันทึกฟอร์ม
        </Button>
        <p className="text-xs text-gray-500 mt-2">
          การเปลี่ยนแปลงจะถูกบันทึกโดยอัตโนมัติ
        </p>
      </div>
    </div>
  );
}; 