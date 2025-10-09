"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Upload, Trash2 } from "lucide-react";

export interface ImageFile {
  file: File;
  preview: string;
  id: string;
}

interface ImageUploadProps {
  images: ImageFile[];
  onImagesChange: (images: ImageFile[]) => void;
  currentImage?: string;
  maxImages?: number;
}

const ImageUpload = ({ 
  images, 
  onImagesChange, 
  currentImage,
  maxImages = 5 
}: ImageUploadProps) => {
  const [dragActive, setDragActive] = useState(false);

  const handleImageUpload = (files: FileList | null) => {
    if (!files) return;
    
    const newImages: ImageFile[] = [];
    
    Array.from(files).forEach((file) => {
      if (file.type.startsWith('image/') && images.length + newImages.length < maxImages) {
        const reader = new FileReader();
        reader.onload = (e) => {
          const newImage: ImageFile = {
            file,
            preview: e.target?.result as string,
            id: Math.random().toString(36).substr(2, 9)
          };
          newImages.push(newImage);
          if (newImages.length === 1) {
            onImagesChange([...images, ...newImages]);
          }
        };
        reader.readAsDataURL(file);
      }
    });
  };

  const removeImage = (imageId: string) => {
    onImagesChange(images.filter(img => img.id !== imageId));
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleImageUpload(e.dataTransfer.files);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-6">Imágenes del Producto</h2>
      
      {/* Current Image Display (for edit mode) */}
      {currentImage && images.length === 0 && (
        <div className="mb-6">
          <h3 className="text-sm font-medium text-gray-700 mb-3">Imagen Actual</h3>
          <div className="w-32 h-32 rounded-lg overflow-hidden bg-gray-100">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={currentImage}
              alt="Imagen actual"
              className="w-full h-full object-cover"
            />
          </div>
          <p className="text-sm text-gray-500 mt-2">
            Sube nuevas imágenes para reemplazar la imagen actual
          </p>
        </div>
      )}
      
      {/* Upload Area */}
      <div
        className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
          dragActive
            ? 'border-glow-500 bg-glow-50'
            : 'border-gray-300 hover:border-glow-400 hover:bg-gray-50'
        }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <div className="flex flex-col items-center space-y-4">
          <div className="w-16 h-16 bg-glow-100 rounded-full flex items-center justify-center">
            <Upload className="w-8 h-8 text-glow-600" />
          </div>
          
          <div>
            <p className="text-lg font-medium text-gray-900 mb-2">
              Arrastra imágenes aquí o haz clic para seleccionar
            </p>
            <p className="text-sm text-gray-500">
              PNG, JPG hasta 10MB (máximo {maxImages} imágenes)
            </p>
          </div>
          
          <label className="cursor-pointer">
            <input
              type="file"
              multiple
              accept="image/*"
              className="hidden"
              onChange={(e) => handleImageUpload(e.target.files)}
            />
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="bg-glow-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-glow-700 transition-colors"
            >
              Seleccionar Imágenes
            </motion.div>
          </label>
        </div>
      </div>

      {/* Image Preview */}
      {images.length > 0 && (
        <div className="mt-6">
          <h3 className="text-sm font-medium text-gray-700 mb-4">
            Imágenes seleccionadas ({images.length}/{maxImages})
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {images.map((image, index) => (
              <div key={image.id} className="relative group">
                <div className="aspect-square rounded-lg overflow-hidden bg-gray-100">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={image.preview}
                    alt={`Preview ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </div>
                
                {/* Primary Image Badge */}
                {index === 0 && (
                  <div className="absolute top-2 left-2 bg-glow-600 text-white text-xs px-2 py-1 rounded">
                    Principal
                  </div>
                )}
                
                {/* Remove Button */}
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => removeImage(image.id)}
                  className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <Trash2 size={14} />
                </motion.button>
              </div>
            ))}
          </div>
          
          <p className="text-sm text-gray-500 mt-3">
            La primera imagen será la imagen principal del producto
          </p>
        </div>
      )}
    </div>
  );
};

export default ImageUpload;