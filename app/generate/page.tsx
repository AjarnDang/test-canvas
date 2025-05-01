'use client';

import React, { useState } from 'react';
import { Button, Layout, Alert, Spin, Card, List, Result } from 'antd';
import { FilePdfOutlined, CheckCircleOutlined, HomeOutlined } from '@ant-design/icons';
import Link from 'next/link';
import { samplePDFs } from '../data/mockPDFs';

const { Header, Content, Footer } = Layout;

const GeneratePDFPage: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const mockPDFs = samplePDFs;

  const generatePDFs = async () => {
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const response = await fetch('/api/generate-pdf', {
        method: 'GET',
      });

      if (!response.ok) {
        throw new Error(`Error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      console.log('Success:', data);
      setSuccess(true);
    } catch (err) {
      console.error('Error generating PDFs:', err);
      setError(err instanceof Error ? err.message : 'Unknown error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout className="min-h-screen">
      <Header
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 999,
          width: '100%',
          display: 'flex',
          alignItems: 'center',
        }}
      >
        <div className="text-white text-xl font-bold mr-6">PDF Form Builder</div>
        <div className="flex-1">
          <Link href="/">
            <Button type="primary" icon={<HomeOutlined />} className="mr-2">
              หน้าหลัก
            </Button>
          </Link>
        </div>
      </Header>

      <Content className="p-6">
        <div className="mb-6 bg-white p-6 rounded-lg shadow-sm">
          <h1 className="text-2xl font-bold mb-4">สร้าง PDF ตัวอย่าง</h1>
          
          {error && (
            <Alert
              message="เกิดข้อผิดพลาด"
              description={error}
              type="error"
              showIcon
              className="mb-4"
            />
          )}
          
          {success ? (
            <Result
              status="success"
              title="สร้าง PDF สำเร็จ!"
              subTitle="PDF ตัวอย่างถูกสร้างแล้วและพร้อมใช้งาน"
              extra={[
                <Link href="/pdf-viewer" key="viewer">
                  <Button type="primary">ไปที่ PDF Viewer</Button>
                </Link>,
                <Link href="/" key="home">
                  <Button>กลับหน้าหลัก</Button>
                </Link>,
              ]}
            />
          ) : (
            <Card className="mb-4">
              <p className="mb-4">
                กดปุ่มด้านล่างเพื่อสร้าง PDF ตัวอย่างสำหรับใช้ในระบบ Form Builder ของเรา PDF
                ที่สร้างจะถูกบันทึกในโฟลเดอร์ <code>/public/pdfs/</code>
              </p>
              <Button
                type="primary"
                icon={<FilePdfOutlined />}
                size="large"
                onClick={generatePDFs}
                loading={loading}
                disabled={loading}
              >
                {loading ? 'กำลังสร้าง PDF...' : 'สร้าง PDF ตัวอย่าง'}
              </Button>
            </Card>
          )}

          {!loading && !success && (
            <div className="mt-6">
              <h2 className="text-lg font-bold mb-2">PDF ที่จะถูกสร้าง:</h2>
              <List
                bordered
                dataSource={mockPDFs}
                renderItem={(item) => (
                  <List.Item>
                    <FilePdfOutlined className="mr-2 text-red-500" /> {item.title} ({item.filename})
                  </List.Item>
                )}
              />
            </div>
          )}

          {loading && (
            <div className="flex justify-center my-8">
              <Spin size="large" tip="กำลังสร้าง PDF..." />
            </div>
          )}

          {success && (
            <div className="mt-6">
              <h2 className="text-lg font-bold mb-2">PDF ที่สร้างแล้ว:</h2>
              <List
                bordered
                dataSource={mockPDFs}
                renderItem={(item) => (
                  <List.Item>
                    <div className="flex items-center">
                      <CheckCircleOutlined className="mr-2 text-green-500" />
                      <span className="mr-2">{item.title}</span>
                      <a
                        href={`/pdfs/${item.filename}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-500 hover:underline"
                      >
                        ดูไฟล์
                      </a>
                    </div>
                  </List.Item>
                )}
              />
            </div>
          )}
        </div>
      </Content>

      <Footer style={{ textAlign: 'center' }}>
        PDF Form Builder ©{new Date().getFullYear()}
      </Footer>
    </Layout>
  );
};

export default GeneratePDFPage; 