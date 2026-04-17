"use client";

import React, { useState } from "react";
import { Upload, message, Form } from "antd";
import { Plus } from "lucide-react";
import CropModal from "./CropModal";

const ASPECT_MAP = {
  eventCard:     { ratio: 3 / 2,   label: "3:2"  },
  eventDetail:   { ratio: 1 / 1,   label: "1:1"  },
  eventMap:      { ratio: 4 / 3,   label: "4:3"  },
  slideshowSlot1: { ratio: 16 / 9, label: "16:9" },
  slideshowSlot2: { ratio: 16 / 9, label: "16:9" },
  slideshowSlot3: { ratio: 16 / 9, label: "16:9" },
};

export default function UploadBox({ label, name, normFile, desc, required = false, onRemove }) {
  const aspect = ASPECT_MAP[name] ?? { ratio: 16 / 9, label: "16:9" };

  const [cropState, setCropState] = useState({
    open: false,
    src: null,
    fileName: "",
    resolveUpload: null,
  });

  // เปิด crop modal แทน upload ทันที
  const handleBeforeUpload = (file) => {
    const isLt5M = file.size / 1024 / 1024 < 5;
    if (!isLt5M) {
      message.error(`"${file.name}" ใหญ่เกิน 5MB`);
      return Upload.LIST_IGNORE;
    }
    if (!file.type.startsWith("image/")) {
      message.error("อัปโหลดเฉพาะไฟล์รูปภาพ");
      return Upload.LIST_IGNORE;
    }

    // อ่านเป็น objectURL แล้วเปิด modal
    const src = URL.createObjectURL(file);

    return new Promise((resolve, reject) => {
      setCropState({ open: true, src, fileName: file.name, resolveUpload: { resolve, reject } });
    });
  };

  const handleCropConfirm = ({ file, url }) => {
    // resolve ด้วยไฟล์ที่ crop แล้ว → Upload จะใส่เข้า fileList
    cropState.resolveUpload.resolve(file);
    setCropState({ open: false, src: null, fileName: "", resolveUpload: null });
  };

  const handleCropCancel = () => {
    cropState.resolveUpload.reject(new Error("cancelled"));
    setCropState({ open: false, src: null, fileName: "", resolveUpload: null });
  };

  return (
    <>
      <CropModal
        open={cropState.open}
        imageSrc={cropState.src}
        aspect={aspect.ratio}
        aspectLabel={aspect.label}
        fileName={cropState.fileName}
        onConfirm={handleCropConfirm}
        onCancel={handleCropCancel}
      />

      <div className="flex flex-col items-center p-4 rounded-2xl bg-gray-50 border-2 border-dashed border-gray-200 hover:border-purple-300 transition-colors">
        <span className="text-sm font-semibold text-gray-700 mb-2">{label}</span>
        <Form.Item
          name={name}
          valuePropName="fileList"
          getValueFromEvent={normFile}
          rules={required ? [{ required: true, message: "Required" }] : []}
          className="mb-1 [&_.ant-form-item-explain]:text-center"
        >
          <Upload
            listType="picture-card"
            maxCount={1}
            beforeUpload={handleBeforeUpload}
            showUploadList={{ showPreviewIcon: true, showRemoveIcon: true }}
            onRemove={(file) => {
              if (onRemove) return onRemove(file, name);
              return true;
            }}
          >
            <div className="flex flex-col items-center justify-center text-gray-400 hover:text-purple-500">
              <Plus size={20} />
              <div className="mt-1 text-xs">Upload</div>
            </div>
          </Upload>
        </Form.Item>

        {/* แสดง aspect ratio hint */}
        <span className="text-[10px] text-purple-400 font-medium">
          {aspect.label} ratio
        </span>
        {desc && <span className="text-xs text-gray-400 text-center mt-0.5">{desc}</span>}
      </div>
    </>
  );
}