"use client";

import React, { useState } from "react";
import { Layout, Menu, Table, Button, Space, Tag, Modal, Input, Tabs } from "antd";
import Link from "next/link";
import {
  SearchOutlined,
  FileTextOutlined,
  EditOutlined,
  EyeOutlined,
  FilePdfOutlined,
  PlusOutlined,
} from "@ant-design/icons";
import type { ColumnsType } from "antd/es/table";
import { formPDFs, catalogPDFs, MockPDF } from "../data/mockPDFs";

const { Header, Content, Footer } = Layout;
const { TabPane } = Tabs;

const App: React.FC = () => {
  const [isPreviewModalVisible, setIsPreviewModalVisible] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState<MockPDF | null>(
    null
  );
  const [activeTabKey, setActiveTabKey] = useState<string>("1");

  const showPreviewModal = (document: MockPDF) => {
    setSelectedDocument(document);
    setIsPreviewModalVisible(true);
  };

  // Form documents table columns
  const formColumns: ColumnsType<MockPDF> = [
    {
      title: "ชื่อเอกสาร",
      dataIndex: "title",
      key: "title",
      render: (text) => <a>{text}</a>,
      sorter: (a, b) => a.title.localeCompare(b.title),
    },
    {
      title: "วันที่สร้าง",
      dataIndex: "createdAt",
      key: "createdAt",
      sorter: (a, b) =>
        new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
    },
    {
      title: "แก้ไขล่าสุด",
      dataIndex: "updatedAt",
      key: "updatedAt",
      sorter: (a, b) =>
        new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime(),
    },
    {
      title: "สถานะ",
      dataIndex: "status",
      key: "status",
      render: (status) => {
        let color = "green";
        if (status === "draft") {
          color = "gold";
        } else if (status === "inactive") {
          color = "volcano";
        }
        return <Tag color={color}>{status.toUpperCase()}</Tag>;
      },
      filters: [
        { text: "Active", value: "active" },
        { text: "Draft", value: "draft" },
        { text: "Inactive", value: "inactive" },
      ],
      onFilter: (value, record) => record.status.indexOf(value as string) === 0,
    },
    {
      title: "ประเภท",
      dataIndex: "type",
      key: "type",
      filters: [
        { text: "Registration", value: "registration" },
        { text: "Application", value: "application" },
        { text: "Survey", value: "survey" },
        { text: "Expense", value: "expense" },
        { text: "Leave", value: "leave" },
      ],
      onFilter: (value, record) => record.type.indexOf(value as string) === 0,
    },
    {
      title: "การจัดการ",
      key: "action",
      render: (_, record) => (
        <Space size="middle">
          <Link href={`/pdf-viewer?id=${record.key}`}>
            <Button type="primary" icon={<EyeOutlined />}>
              ดู PDF
            </Button>
          </Link>
          <Button
            type="default"
            icon={<FileTextOutlined />}
            onClick={() => showPreviewModal(record)}
          >
            แสดงตัวอย่าง
          </Button>
          <Link href={`/form-builder?id=${record.key}`}>
            <Button type="default" icon={<EditOutlined />}>
              แก้ไข
            </Button>
          </Link>
        </Space>
      ),
    },
  ];

  // Catalog PDFs table columns
  const catalogColumns: ColumnsType<MockPDF> = [
    {
      title: "ชื่อแคตตาล็อก",
      dataIndex: "title",
      key: "title",
      render: (text) => <a>{text}</a>,
      sorter: (a, b) => a.title.localeCompare(b.title),
    },
    {
      title: "ชื่อไฟล์",
      dataIndex: "filename",
      key: "filename",
    },
    {
      title: "วันที่เพิ่ม",
      dataIndex: "createdAt",
      key: "createdAt",
      sorter: (a, b) =>
        new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
    },
    {
      title: "การจัดการ",
      key: "action",
      render: (_, record) => (
        <Space size="middle">
          <Link href={`/pdf-viewer?id=${record.key}`}>
            <Button type="primary" icon={<EyeOutlined />}>
              ดู PDF
            </Button>
          </Link>
        </Space>
      ),
    },
  ];

  return (
    <Layout>
      <Header
        style={{
          position: "sticky",
          top: 0,
          zIndex: 999,
          width: "100%",
          display: "flex",
          alignItems: "center",
        }}
      >
        <div className="text-white text-xl font-bold mr-6">
          PDF Form Builder
        </div>
        <Menu
          theme="dark"
          mode="horizontal"
          defaultSelectedKeys={["1"]}
          items={[
            { key: "1", label: "หน้าหลัก" },
            { key: "2", label: "จัดการเอกสาร" },
            { key: "3", label: "รายงาน" },
          ]}
          style={{ flex: 1, minWidth: 0 }}
        />
      </Header>
      <Content className="p-6">
        <div className="p-6 bg-white rounded-lg">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold">ระบบจัดการเอกสาร PDF</h1>
            <div>
              <Link href="/pdf-viewer">
                <Button
                  type="default"
                  icon={<EyeOutlined />}
                  className="mr-2"
                >
                  PDF Viewer
                </Button>
              </Link>
              <Link href="/generate">
                <Button
                  type="default"
                  icon={<FilePdfOutlined />}
                  className="mr-2"
                >
                  สร้าง PDF ตัวอย่าง
                </Button>
              </Link>
              <Link href="/form-builder">
                <Button type="primary" icon={<PlusOutlined />} size="large">
                  สร้างฟอร์มใหม่
                </Button>
              </Link>
            </div>
          </div>

          <div className="mb-4">
            <Input.Search
              placeholder="ค้นหาเอกสาร"
              enterButton={<SearchOutlined />}
              size="large"
              style={{ maxWidth: 400 }}
            />
          </div>

          <Tabs activeKey={activeTabKey} onChange={setActiveTabKey}>
            <TabPane tab="แบบฟอร์ม" key="1">
              <Table
                columns={formColumns}
                dataSource={formPDFs}
                pagination={{ pageSize: 5 }}
                className="shadow-sm"
                rowKey="key"
              />
            </TabPane>
            <TabPane tab="แคตตาล็อก" key="2">
              <Table
                columns={catalogColumns}
                dataSource={catalogPDFs}
                pagination={{ pageSize: 5 }}
                className="shadow-sm"
                rowKey="key"
              />
            </TabPane>
          </Tabs>
        </div>
      </Content>

      <Modal
        title={selectedDocument?.title}
        open={isPreviewModalVisible}
        onCancel={() => setIsPreviewModalVisible(false)}
        footer={[
          <Button key="close" onClick={() => setIsPreviewModalVisible(false)}>
            ปิด
          </Button>,
          selectedDocument && (
            <Link key="view" href={`/pdf-viewer?id=${selectedDocument.key}`}>
              <Button type="primary" icon={<EyeOutlined />}>
                ดู PDF
              </Button>
            </Link>
          ),
          selectedDocument && (
            <Link key="edit" href={`/form-builder?id=${selectedDocument.key}`}>
              <Button type="default" icon={<EditOutlined />}>
                แก้ไขฟอร์ม
              </Button>
            </Link>
          ),
        ]}
        width={800}
      >
        {selectedDocument && (
          <div className="p-4 border rounded">
            <div className="flex items-center justify-center mb-4">
              <FileTextOutlined style={{ fontSize: 48 }} />
            </div>
            <p className="text-center">
              คลิกปุ่ม &quot;ดู PDF&quot; เพื่อดูเอกสาร PDF หรือ
              &quot;แก้ไขฟอร์ม&quot; เพื่อแก้ไขฟอร์มนี้
            </p>
            
            {/* แสดงรายละเอียดเพิ่มเติมของเอกสาร */}
            <div className="mt-4">
              <p><strong>ชื่อไฟล์:</strong> {selectedDocument.filename}</p>
              <p><strong>สถานะ:</strong> {selectedDocument.status.toUpperCase()}</p>
              <p><strong>ประเภท:</strong> {selectedDocument.type}</p>
              <p><strong>สร้างเมื่อ:</strong> {selectedDocument.createdAt}</p>
              <p><strong>แก้ไขล่าสุด:</strong> {selectedDocument.updatedAt}</p>
            </div>
          </div>
        )}
      </Modal>

      <Footer style={{ textAlign: "center" }}>
        PDF Form Builder ©{new Date().getFullYear()}
      </Footer>
    </Layout>
  );
};

export default App;
