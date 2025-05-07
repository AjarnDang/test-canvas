"use client";

import React, { useState, useEffect } from "react";
import { FormItem } from "../types";

interface FormElementSettingsProps {
  formItem: FormItem;
  isOpen: boolean;
  onClose: () => void;
  onSave: (updatedItem: FormItem) => void;
  onDelete?: () => void;
}

const FormElementSettings: React.FC<FormElementSettingsProps> = ({
  formItem,
  isOpen,
  onClose,
  onSave,
  onDelete,
}) => {
  const [editedItem, setEditedItem] = useState<FormItem>({ ...formItem });

  // Reset form when item changes
  useEffect(() => {
    setEditedItem({ ...formItem });
  }, [formItem]);

  if (!isOpen) return null;

  const handleInputChange = (
    key: string,
    value: string | number | boolean | string[]
  ) => {
    setEditedItem((prev) => ({
      ...prev,
      [key]: value,
    }));
    
    // For "value" changes, update immediately to keep inputs in sync with form canvas
    if (key === "value") {
      onSave({
        ...editedItem,
        value
      });
    }

    // For "label" changes, update immediately to show changes on form element
    if (key === "label") {
      onSave({
        ...editedItem,
        label: value as string
      });
    }
  };

  const handleConfigChange = (
    key: string,
    value: string | number | boolean | null
  ) => {
    // If value is empty string for numeric fields, set to null to remove it
    const finalValue = value === "" ? null : value;

    const updatedConfig = {
      ...editedItem.config,
      [key]: finalValue,
    };
    
    setEditedItem((prev) => ({
      ...prev,
      config: updatedConfig,
    }));
    
    // Update immediately to keep settings in sync with canvas
    onSave({
      ...editedItem,
      config: updatedConfig
    });
  };

  const handleCheckboxOptionChange = (index: number, value: string) => {
    if (!editedItem.checkboxOptions) return;

    const newOptions = [...editedItem.checkboxOptions];
    newOptions[index] = value;

    const updatedItem = {
      ...editedItem,
      checkboxOptions: newOptions,
    };

    setEditedItem(updatedItem);
    
    // Update immediately to keep values in sync with form canvas
    onSave(updatedItem);
  };

  const handleAddCheckboxOption = () => {
    const currentOptions = editedItem.checkboxOptions || [];
    const newOptions = [
      ...currentOptions,
      `ตัวเลือกที่ ${currentOptions.length + 1}`,
    ];
    
    const updatedItem = {
      ...editedItem,
      checkboxOptions: newOptions,
    };
    
    setEditedItem(updatedItem);
    
    // Update immediately to keep values in sync with form canvas
    onSave(updatedItem);
  };

  const handleRemoveCheckboxOption = (index: number) => {
    if (!editedItem.checkboxOptions) return;

    const newOptions = editedItem.checkboxOptions.filter((_, i) => i !== index);
    
    // If we remove an option that is selected, update the value too
    let newValue = editedItem.value;
    if (Array.isArray(editedItem.value)) {
      const removedOption = editedItem.checkboxOptions[index];
      if (editedItem.value.includes(removedOption)) {
        newValue = editedItem.value.filter(val => val !== removedOption);
      }
    }
    
    const updatedItem = {
      ...editedItem,
      checkboxOptions: newOptions,
      value: newValue
    };
    
    setEditedItem(updatedItem);
    
    // Update immediately to keep values in sync with form canvas
    onSave(updatedItem);
  };

  // Add function to handle checkbox option selection
  const handleCheckboxOptionSelection = (option: string, isChecked: boolean) => {
    const currentValues = Array.isArray(editedItem.value) ? editedItem.value : [];
    
    let newValues: string[];
    if (isChecked) {
      // Add the option if it's not already selected
      newValues = [...currentValues, option];
    } else {
      // Remove the option if it's currently selected
      newValues = currentValues.filter(val => val !== option);
    }
    
    const updatedItem = {
      ...editedItem,
      value: newValues
    };
    
    setEditedItem(updatedItem);
    
    // Update immediately to keep values in sync with form canvas
    onSave(updatedItem);
  };

  const handleSave = () => {
    onSave(editedItem);
    onClose();
  };

  const renderSettings = () => (
    <div className="space-y-4">
      {/* Label setting - available for all types */}
      <div className="border-b pb-2 mb-3">
        <label htmlFor="field-label" className="block text-sm font-medium text-gray-700">
          ชื่อฟิลด์
        </label>
        <input
          id="field-label"
          type="text"
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          value={editedItem.label}
          onChange={(e) => handleInputChange("label", e.target.value)}
          placeholder="ชื่อฟิลด์"
          aria-label="ชื่อฟิลด์"
        />
      </div>

      {/* Field value - available for all types except checkbox */}
      {!["checkbox"].includes(editedItem.type) && (
        <div className="border-b pb-2 mb-3">
          <label htmlFor="field-value" className="block text-sm font-medium text-gray-700">
            ค่าในฟิลด์
          </label>
          {editedItem.type === "textarea" ? (
            <textarea
              id="field-value"
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              value={editedItem.value as string || ""}
              onChange={(e) => handleInputChange("value", e.target.value)}
              placeholder="ค่าในฟิลด์"
              aria-label="ค่าในฟิลด์"
              rows={editedItem.config?.rows || 3}
            />
          ) : (
            <input
              id="field-value"
              type={editedItem.type === "number" ? "number" : "text"}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              value={editedItem.value as string || ""}
              onChange={(e) => handleInputChange(
                "value", 
                editedItem.type === "number" && e.target.value 
                  ? parseFloat(e.target.value) 
                  : e.target.value
              )}
              placeholder="ค่าในฟิลด์"
              aria-label="ค่าในฟิลด์"
              min={editedItem.config?.min}
              max={editedItem.config?.max}
              step={editedItem.config?.step}
            />
          )}
        </div>
      )}

      {/* Checkbox Options - only for checkbox type */}
      {editedItem.type === "checkbox" && (
        <div className="border-b pb-2 mb-3">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            ตัวเลือก
          </label>
          <div className="space-y-2">
            {(editedItem.checkboxOptions || []).map((option, index) => (
              <div key={index} className="flex items-center">
                <input
                  type="checkbox"
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded mr-2"
                  checked={Array.isArray(editedItem.value) && editedItem.value.includes(option)}
                  onChange={(e) => handleCheckboxOptionSelection(option, e.target.checked)}
                  id={`option-value-${index}`}
                  aria-label={`เลือก ${option}`}
                  title={`เลือก ${option}`}
                />
                <input
                  type="text"
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  value={option}
                  onChange={(e) =>
                    handleCheckboxOptionChange(index, e.target.value)
                  }
                  placeholder={`ตัวเลือกที่ ${index + 1}`}
                  aria-label={`ตัวเลือกที่ ${index + 1}`}
                />
                <button
                  type="button"
                  className="p-2 text-red-500 hover:text-red-700"
                  onClick={() => handleRemoveCheckboxOption(index)}
                  aria-label={`ลบตัวเลือกที่ ${index + 1}`}
                >
                  ✕
                </button>
              </div>
            ))}
            <button
              type="button"
              className="mt-2 px-3 py-1 bg-blue-100 hover:bg-blue-200 text-blue-800 rounded-md flex items-center"
              onClick={handleAddCheckboxOption}
            >
              <span className="mr-1">+</span> เพิ่มตัวเลือก
            </button>
          </div>
        </div>
      )}

      {/* Text Field Settings */}
      {["text", "name", "email", "phone", "textarea"].includes(
        editedItem.type
      ) && (
        <div className="border-b pb-2 mb-3">
          <div className="mb-3">
            <label htmlFor="field-placeholder" className="block text-sm font-medium text-gray-700">
              Placeholder
            </label>
            <input
              id="field-placeholder"
              type="text"
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              value={editedItem.config?.placeholder || ""}
              onChange={(e) =>
                handleConfigChange("placeholder", e.target.value)
              }
              placeholder="Placeholder text"
              aria-label="Placeholder text"
            />
          </div>

          <div>
            <label htmlFor="field-maxlength" className="block text-sm font-medium text-gray-700">
              จำนวนตัวอักษรสูงสุด
            </label>
            <input
              id="field-maxlength"
              type="number"
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              value={editedItem.config?.maxLength || ""}
              onChange={(e) =>
                handleConfigChange(
                  "maxLength",
                  e.target.value ? parseInt(e.target.value) : ""
                )
              }
              placeholder="จำนวนตัวอักษรสูงสุด"
              aria-label="จำนวนตัวอักษรสูงสุด"
            />
          </div>
        </div>
      )}

      {/* Textarea specific settings */}
      {editedItem.type === "textarea" && (
        <div className="border-b pb-2 mb-3">
          <label htmlFor="field-rows" className="block text-sm font-medium text-gray-700">
            จำนวนแถว
          </label>
          <input
            id="field-rows"
            type="number"
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            value={editedItem.config?.rows || ""}
            onChange={(e) =>
              handleConfigChange(
                "rows",
                e.target.value ? parseInt(e.target.value) : ""
              )
            }
            placeholder="จำนวนแถว"
            aria-label="จำนวนแถว"
          />
        </div>
      )}

      {/* Number input specific settings */}
      {["number"].includes(editedItem.type) && (
        <div className="border-b pb-2 mb-3 space-y-3">
          <div>
            <label htmlFor="field-min" className="block text-sm font-medium text-gray-700">
              ค่าต่ำสุด
            </label>
            <input
              id="field-min"
              type="number"
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              value={editedItem.config?.min || ""}
              onChange={(e) =>
                handleConfigChange(
                  "min",
                  e.target.value ? parseInt(e.target.value) : ""
                )
              }
              placeholder="ค่าต่ำสุด"
              aria-label="ค่าต่ำสุด"
            />
          </div>

          <div>
            <label htmlFor="field-max" className="block text-sm font-medium text-gray-700">
              ค่าสูงสุด
            </label>
            <input
              id="field-max"
              type="number"
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              value={editedItem.config?.max || ""}
              onChange={(e) =>
                handleConfigChange(
                  "max",
                  e.target.value ? parseInt(e.target.value) : ""
                )
              }
              placeholder="ค่าสูงสุด"
              aria-label="ค่าสูงสุด"
            />
          </div>

          <div>
            <label htmlFor="field-step" className="block text-sm font-medium text-gray-700">
              ขั้นการเปลี่ยนแปลง
            </label>
            <input
              id="field-step"
              type="number"
              step="0.01"
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              value={editedItem.config?.step || ""}
              onChange={(e) =>
                handleConfigChange(
                  "step",
                  e.target.value ? parseFloat(e.target.value) : ""
                )
              }
              placeholder="ขั้นการเปลี่ยนแปลง"
              aria-label="ขั้นการเปลี่ยนแปลง"
            />
          </div>
        </div>
      )}

      {/* Required field setting - available for all types */}
      <div className="flex items-center">
        <input
          type="checkbox"
          id="required-field"
          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          checked={editedItem.config?.required || false}
          onChange={(e) =>
            handleConfigChange("required", e.target.checked)
          }
        />
        <label
          htmlFor="required-field"
          className="ml-2 block text-sm text-gray-900"
        >
          จำเป็นต้องกรอก
        </label>
      </div>
    </div>
  );

  return (
    <div className="fixed top-0 right-0 h-full w-72 bg-white shadow-lg border-l border-gray-200 z-50 overflow-y-auto">
      <div className="sticky top-0 bg-white p-4 border-b border-gray-200">
        <div className="flex justify-between items-center">
          <h3 className="text-sm font-medium text-gray-800">ตั้งค่า {editedItem.label}</h3>
          <div className="flex items-center">
            {onDelete && (
              <button
                className="text-red-500 hover:text-red-700 mr-3"
                onClick={onDelete}
                aria-label="ลบฟิลด์นี้"
                title="ลบฟิลด์นี้"
              >
                ลบ
              </button>
            )}
            <button
              className="text-gray-500 hover:text-gray-700"
              onClick={onClose}
              aria-label="ปิด"
            >
              ✕
            </button>
          </div>
        </div>
      </div>
      
      <div className="p-4">
        {renderSettings()}
        
        <div className="sticky bottom-0 bg-white pt-2 border-t mt-4">
          <div className="flex justify-end space-x-2">
            <button
              className="px-3 py-1 text-sm border border-gray-300 rounded-md text-gray-700 hover:bg-gray-100"
              onClick={onClose}
            >
              ยกเลิก
            </button>
            <button
              className="px-3 py-1 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700"
              onClick={handleSave}
            >
              บันทึก
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FormElementSettings; 