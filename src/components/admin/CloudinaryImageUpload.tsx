"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Upload, Trash2 } from "lucide-react";
import { CldUploadWidget } from 'next-cloudinary';
import type { CloudinaryUploadWidgetResults } from 'next-cloudinary';

export interface ImageFile {
  file?: File;
  preview?: string;
  id: string;
  url: string;
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
  const [uploading, setUploading] = useState(false);

  const removeImage = (imageId: string) => {
    onImagesChange(images.filter(img => img.id !== imageId));
  };

  const handleUploadSuccess = (result: CloudinaryUploadWidgetResults) => {
    if (result.event === "success" && result.info && typeof result.info !== "string") {
      const newImage: ImageFile = {
        id: result.info.public_id,
        url: result.info.secure_url,
        preview: result.info.secure_url
      };
      onImagesChange([...images, newImage]);
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
      
      {/* Cloudinary Upload Widget */}
      {images.length < maxImages && (
        <CldUploadWidget
          uploadPreset={process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || "unsigned_preset"}
          options={{
            folder: "glowhair",
            maxFiles: maxImages - images.length,
            resourceType: "image",
            clientAllowedFormats: ["jpg", "jpeg", "png", "gif", "webp"],
            maxFileSize: 10000000, // 10MB
            cropping: false,
            multiple: true,
            sources: ["local", "url", "camera"]
          }}
          onUpload={handleUploadSuccess}
          onOpen={() => setUploading(true)}
          onClose={() => setUploading(false)}
        >
          {({ open }) => (
            <div
              onClick={() => open()}
              className="border-2 border-dashed rounded-lg p-8 text-center transition-colors border-gray-300 hover:border-glow-400 hover:bg-gray-50 cursor-pointer group"
            >
              <div className="flex flex-col items-center space-y-4">
                <div className="w-16 h-16 bg-glow-100 rounded-full flex items-center justify-center group-hover:bg-glow-200 transition-colors">
                  <Upload className="w-8 h-8 text-glow-600" />
                </div>
                
                <div>
                  {uploading ? (
                    <>
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-glow-500 mx-auto mb-2"></div>
                      <p className="text-lg font-medium text-gray-900 mb-2">
                        Subiendo imágenes...
                      </p>
                    </>
                  ) : (
                    <>
                      <p className="text-lg font-medium text-gray-900 mb-2">
                        Haz clic para subir imágenes a Cloudinary
                      </p>
                      <p className="text-sm text-gray-500">
                        PNG, JPG, WEBP hasta 10MB (máximo {maxImages - images.length} más)
                      </p>
                      <p className="text-xs text-gray-400 mt-2">
                        Se subirán a la carpeta &quot;glowhair&quot; en Cloudinary
                      </p>
                    </>
                  )}
                </div>
                
                {!uploading && (
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="bg-glow-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-glow-700 transition-colors"
                  >
                    Seleccionar Imágenes
                  </motion.div>
                )}
              </div>
            </div>
          )}
        </CldUploadWidget>
      )}

      {/* Image Preview */}
      {images.length > 0 && (
        <div className="mt-6">
          <h3 className="text-sm font-medium text-gray-700 mb-4">
            Imágenes subidas ({images.length}/{maxImages})
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {images.map((image, index) => (
              <div key={image.id} className="relative group">
                <div className="aspect-square rounded-lg overflow-hidden bg-gray-100">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={image.url || image.preview}
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
                
                {/* Cloudinary URL indicator */}
                <div className="absolute bottom-2 left-2 bg-black bg-opacity-75 text-white text-xs px-1 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                  Cloudinary
                </div>
              </div>
            ))}
          </div>
          
          <p className="text-sm text-gray-500 mt-3">
            La primera imagen será la imagen principal del producto. Todas las imágenes se almacenan en Cloudinary.
          </p>
        </div>
      )}
    </div>
  );
};

export default ImageUpload;