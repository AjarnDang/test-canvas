import { FormItem } from "../form-builder/types";

/**
 * Default form items for each PDF catalog
 * This provides a starting point for form layouts based on PDF ID
 */
export const defaultFormItems: Record<string, FormItem[]> = {
  "1": [
    // price-list
    {
      id: "text-input-1",
      type: "text",
      label: "รหัสสินค้า",
      position: { x: 20, y: 50 },
    },
    {
      id: "text-input-2",
      type: "text",
      label: "ชื่อสินค้า",
      position: { x: 250, y: 50 },
    },
    {
      id: "number-input-1",
      type: "number",
      label: "ราคา",
      position: { x: 20, y: 150 },
    },
    {
      id: "number-input-2",
      type: "number",
      label: "จำนวน",
      position: { x: 250, y: 150 },
    },
  ],
  "2": [
    // ALL_NEW_CAMRY_2024
    {
      id: "text-input-1",
      type: "text",
      label: "รุ่นรถ",
      position: { x: 20, y: 50 },
    },
    {
      id: "text-input-2",
      type: "text",
      label: "สี",
      position: { x: 250, y: 50 },
    },
    {
      id: "select-1",
      type: "select",
      label: "ขนาดเครื่องยนต์",
      position: { x: 20, y: 150 },
    },
    {
      id: "number-input-1",
      type: "number",
      label: "ราคา",
      position: { x: 250, y: 150 },
    },
  ],
  "3": [
    // atto3-th
    {
      id: "text-input-1",
      type: "text",
      label: "รุ่นรถ",
      position: { x: 20, y: 50 },
    },
    {
      id: "text-input-2",
      type: "text",
      label: "ชื่อผู้จอง",
      position: { x: 250, y: 50 },
    },
    {
      id: "number-input-1",
      type: "number",
      label: "จำนวนเงินจอง",
      position: { x: 20, y: 150 },
    },
    {
      id: "date-1",
      type: "date",
      label: "วันที่จอง",
      position: { x: 250, y: 150 },
    },
  ],
  "4": [
    // Honda-Accord_Catalogue
    {
      id: "text-input-1",
      type: "text",
      label: "รุ่นรถ",
      position: { x: 20, y: 50 },
    },
    {
      id: "select-1",
      type: "select",
      label: "สี",
      position: { x: 250, y: 50 },
    },
    {
      id: "text-input-2",
      type: "text",
      label: "อุปกรณ์เสริม",
      position: { x: 20, y: 150 },
    },
    {
      id: "number-input-1",
      type: "number",
      label: "ราคา",
      position: { x: 250, y: 150 },
    },
  ],
  "5": [
    // SEALION
    {
      id: "text-input-1",
      type: "text",
      label: "รหัสรุ่น",
      position: { x: 20, y: 50 },
    },
    {
      id: "text-input-2",
      type: "text",
      label: "ชื่อรุ่น",
      position: { x: 250, y: 50 },
    },
    {
      id: "number-input-1",
      type: "number",
      label: "ความจุแบตเตอรี่",
      position: { x: 20, y: 150 },
    },
    {
      id: "number-input-2",
      type: "number",
      label: "ราคา",
      position: { x: 250, y: 150 },
    },
  ],
}; 