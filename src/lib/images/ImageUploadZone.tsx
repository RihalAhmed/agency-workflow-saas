"use client";

import React, { useState, useRef } from "react";
import { Upload, X, Loader2, Image as ImageIcon } from "lucide-react";
import { classifyImage, ImageClassification } from "./image-classify";

export interface ClassifiedImage {
  file: File;
  previewUrl: string;
  slot: ImageClassification;
  id: string;
}

export interface ImageUploadZoneProps {
  onImagesChange: (images: ClassifiedImage[]) => void;
}

export function ImageUploadZone({ onImagesChange }: ImageUploadZoneProps) {
  const [images, setImages] = useState<ClassifiedImage[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setIsProcessing(true);

    const newImages: ClassifiedImage[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (!file.type.startsWith("image/")) continue;

      const slot = await classifyImage(file);
      const previewUrl = URL.createObjectURL(file);
      
      newImages.push({
        file,
        previewUrl,
        slot,
        id: Math.random().toString(36).substring(7),
      });
    }

    const updatedImages = [...images, ...newImages];
    setImages(updatedImages);
    onImagesChange(updatedImages);
    setIsProcessing(false);
    
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleRemove = (id: string) => {
    const updated = images.filter((img) => img.id !== id);
    setImages(updated);
    onImagesChange(updated);
  };

  const handleSlotChange = (id: string, newSlot: ImageClassification) => {
    const updated = images.map((img) => 
      img.id === id ? { ...img, slot: newSlot } : img
    );
    setImages(updated);
    onImagesChange(updated);
  };

  return (
    <div className="space-y-4">
      <div 
        className="border-2 border-dashed border-slate-700 hover:border-amber-400 bg-slate-900/50 rounded-xl p-8 text-center transition-colors cursor-pointer"
        onClick={() => fileInputRef.current?.click()}
        onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); }}
        onDrop={(e) => {
          e.preventDefault();
          e.stopPropagation();
          handleFiles(e.dataTransfer.files);
        }}
      >
        <input 
          ref={fileInputRef}
          type="file" 
          multiple 
          accept="image/*" 
          className="hidden" 
          onChange={(e) => handleFiles(e.target.files)}
        />
        
        {isProcessing ? (
          <div className="flex flex-col items-center justify-center space-y-3 text-amber-400">
            <Loader2 className="w-8 h-8 animate-spin" />
            <p className="text-sm font-medium">Scanning with Face-API.js...</p>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center space-y-3 text-slate-400">
            <div className="w-12 h-12 bg-slate-800 rounded-full flex items-center justify-center text-slate-300">
              <Upload className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-300">Drop prospect photos here</p>
              <p className="text-xs mt-1">AI will automatically place them in Hero or About sections</p>
            </div>
          </div>
        )}
      </div>

      {images.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {images.map((img) => (
            <div key={img.id} className="relative group bg-slate-900 rounded-lg overflow-hidden border border-slate-800">
              <div className="aspect-square bg-slate-800 relative">
                <img 
                  src={img.previewUrl} 
                  alt="Upload preview" 
                  className="w-full h-full object-cover"
                />
                <button
                  type="button"
                  onClick={() => handleRemove(img.id)}
                  className="absolute top-2 right-2 bg-slate-900/80 p-1.5 rounded-md text-slate-300 hover:text-red-400 hover:bg-slate-900 transition-colors opacity-0 group-hover:opacity-100"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="p-3">
                <select 
                  value={img.slot}
                  onChange={(e) => handleSlotChange(img.id, e.target.value as ImageClassification)}
                  className="w-full bg-slate-950 border border-slate-700 rounded px-2 py-1.5 text-xs text-white focus:outline-none focus:border-amber-400"
                >
                  <option value="hero">Hero (Landscape)</option>
                  <option value="about">About (Portrait/Face)</option>
                  <option value="unknown">Unassigned</option>
                </select>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
