"use client";

import React, { useState, useCallback } from "react";
import Cropper from "react-easy-crop";
import { Slider } from "antd";
import { X, Check, ZoomIn } from "lucide-react";

async function getCroppedImg(imageSrc, pixelCrop, fileName = "cropped.jpg") {
  const image = await createImageBitmap(
    await fetch(imageSrc).then((r) => r.blob()),
  );
  const canvas = document.createElement("canvas");
  canvas.width = pixelCrop.width;
  canvas.height = pixelCrop.height;
  const ctx = canvas.getContext("2d");

  ctx.drawImage(
    image,
    pixelCrop.x,
    pixelCrop.y,
    pixelCrop.width,
    pixelCrop.height,
    0,
    0,
    pixelCrop.width,
    pixelCrop.height,
  );

  return new Promise((resolve) => {
    canvas.toBlob(
      (blob) => {
        const file = new File([blob], fileName, { type: "image/jpeg" });
        const url = URL.createObjectURL(blob);
        resolve({ file, url });
      },
      "image/jpeg",
      0.92,
    );
  });
}

const ASPECT_LABELS = {
  "3/2": "3:2",
  "1/1": "1:1",
  "4/3": "4:3",
  "16/9": "16:9",
};

export default function CropModal({
  open,
  imageSrc,
  aspect = 16 / 9,
  aspectLabel,
  fileName,
  onConfirm,
  onCancel,
}) {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);

  const onCropComplete = useCallback((_, croppedPixels) => {
    setCroppedAreaPixels(croppedPixels);
  }, []);

  const handleConfirm = async () => {
    if (!croppedAreaPixels) return;
    const result = await getCroppedImg(imageSrc, croppedAreaPixels, fileName);
    onConfirm(result);
  };

  if (!open || !imageSrc) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div>
            <h3 className="text-base font-bold text-gray-800">Crop Image</h3>
            {aspectLabel && (
              <p className="text-xs text-gray-400 mt-0.5">
                Aspect ratio:{" "}
                <span className="font-semibold text-purple-600">
                  {aspectLabel}
                </span>
              </p>
            )}
          </div>
          <button
            type="button"
            onClick={onCancel}
            className="p-2 rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Crop Area */}
        <div className="relative w-full bg-gray-900" style={{ height: 320 }}>
          <Cropper
            image={imageSrc}
            crop={crop}
            zoom={zoom}
            aspect={aspect}
            onCropChange={setCrop}
            onZoomChange={setZoom}
            onCropComplete={onCropComplete}
            style={{
              containerStyle: { borderRadius: 0 },
            }}
          />
        </div>

        {/* Zoom Slider */}
        <div className="px-6 py-4 border-t border-gray-100">
          <div className="flex items-center gap-3">
            <ZoomIn size={16} className="text-gray-400 flex-shrink-0" />
            <Slider
              min={1}
              max={3}
              step={0.05}
              value={zoom}
              onChange={setZoom}
              className="flex-1"
              tooltip={{ formatter: (v) => `${Math.round(v * 100)}%` }}
            />
            <span className="text-xs text-gray-400 w-10 text-right">
              {Math.round(zoom * 100)}%
            </span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 px-6 pb-5">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 py-2.5 rounded-full text-sm font-medium text-gray-600 hover:bg-gray-100 transition-colors border border-gray-200"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            className="flex-1 py-2.5 rounded-full text-sm font-medium bg-purple-600 text-white hover:bg-purple-700 shadow-md transition-all flex items-center justify-center gap-2"
          >
            <Check size={16} />
            Use this crop
          </button>
        </div>
      </div>
    </div>
  );
}
