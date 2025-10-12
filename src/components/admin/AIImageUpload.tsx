/**
 * Componente de subida de imágenes con análisis de IA
 * Permite subir una imagen y automáticamente analizar el producto con OpenAI
 */

import { useCallback, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Upload, X, Sparkles, Loader2 } from "lucide-react";
import { useAIProductAnalysis } from "@/hooks/useAIProductAnalysis";
import { useCloudinaryUpload } from "@/hooks/useCloudinaryUpload";

export interface ImageFile {
  file: File;
  preview: string;
  id: string;
  cloudinaryUrl?: string; // URL permanente de Cloudinary
  publicId?: string;
}

interface ProductData {
  name: string;
  description: string;
  category: string;
  benefits: string[];
  usage: string;
  ingredients: string;
}

interface AIImageUploadProps {
  onImageSelected: (image: ImageFile) => void;
  onProductDataAnalyzed: (data: ProductData) => void;
  maxSizeMB?: number;
}

const AIImageUpload: React.FC<AIImageUploadProps> = ({
  onImageSelected,
  onProductDataAnalyzed,
  maxSizeMB = 10,
}) => {
  const [selectedImage, setSelectedImage] = useState<ImageFile | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  
  const { isAnalyzing, error: analysisError, analyzeProduct } = useAIProductAnalysis();
  const { uploadImage, uploading: isUploadingToCloud } = useCloudinaryUpload();

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const processImage = useCallback(async (file: File) => {
    // Validar tamaño
    const maxSizeBytes = maxSizeMB * 1024 * 1024;
    if (file.size > maxSizeBytes) {
      alert(`La imagen es muy grande. Tamaño máximo: ${maxSizeMB}MB`);
      return;
    }

    // Validar tipo
    if (!file.type.startsWith("image/")) {
      alert("Solo se permiten archivos de imagen");
      return;
    }

    // Crear preview local
    const preview = URL.createObjectURL(file);
    const imageFile: ImageFile = {
      file,
      preview,
      id: `${Date.now()}-${file.name}`,
    };

    setSelectedImage(imageFile);

    try {
      // 1. SUBIR A CLOUDINARY (en paralelo con el análisis de IA)
      console.log('🔄 Iniciando upload a Cloudinary...');
      const cloudinaryUrl = await uploadImage(file);
      
      if (!cloudinaryUrl) {
        console.error('❌ Error al subir a Cloudinary');
        alert('Error al subir la imagen a Cloudinary. Intenta nuevamente.');
        return;
      }

      console.log('✅ Imagen subida a Cloudinary:', cloudinaryUrl);

      // Actualizar con URL permanente
      const updatedImageFile: ImageFile = {
        ...imageFile,
        cloudinaryUrl,
      };
      
      setSelectedImage(updatedImageFile);
      onImageSelected(updatedImageFile);

      // 2. ANALIZAR CON IA
      console.log('🔄 Iniciando análisis con IA...');
      const productData = await analyzeProduct(file);
      
      if (productData) {
        console.log('✅ Análisis de IA completado');
        onProductDataAnalyzed(productData);
      } else {
        console.warn('⚠️ El análisis de IA no retornó datos');
      }
    } catch (error) {
      console.error('❌ Error en processImage:', error);
      alert('Error al procesar la imagen. Intenta nuevamente.');
    }
  }, [maxSizeMB, onImageSelected, onProductDataAnalyzed, analyzeProduct, uploadImage]);

  const handleDrop = useCallback(
    async (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);

      const files = Array.from(e.dataTransfer.files);
      if (files.length > 0) {
        await processImage(files[0]);
      }
    },
    [processImage]
  );

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      await processImage(files[0]);
    }
  };

  const removeImage = () => {
    if (selectedImage) {
      URL.revokeObjectURL(selectedImage.preview);
      setSelectedImage(null);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
            <Sparkles className="text-glow-600" size={24} />
            Imagen del Producto con IA
          </h2>
          <p className="text-sm text-gray-600 mt-1">
            Sube una imagen y la IA analizará el producto automáticamente
          </p>
        </div>
      </div>

      {/* Upload Area */}
      {!selectedImage && (
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`relative border-2 border-dashed rounded-xl p-8 text-center transition-all duration-200 ${
            isDragging
              ? "border-glow-500 bg-glow-50"
              : "border-gray-300 hover:border-glow-400 hover:bg-gray-50"
          }`}
        >
          <input
            type="file"
            id="ai-image-upload"
            accept="image/*"
            onChange={handleFileSelect}
            className="hidden"
            disabled={isAnalyzing}
          />

          <label
            htmlFor="ai-image-upload"
            className="cursor-pointer flex flex-col items-center justify-center"
          >
            <div className="w-16 h-16 bg-glow-100 rounded-full flex items-center justify-center mb-4">
              {isAnalyzing ? (
                <Loader2 className="text-glow-600 animate-spin" size={32} />
              ) : (
                <Upload className="text-glow-600" size={32} />
              )}
            </div>

            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {isAnalyzing
                ? "Analizando imagen con IA..."
                : "Arrastra la imagen aquí o haz clic para seleccionar"}
            </h3>

            <p className="text-sm text-gray-500 mb-4">
              PNG, JPG hasta {maxSizeMB}MB (máximo 1 imagen)
            </p>

            {!isAnalyzing && (
              <motion.button
                type="button"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="bg-gradient-to-r from-glow-600 to-glow-500 text-white px-6 py-3 rounded-lg hover:from-glow-700 hover:to-glow-600 transition-all duration-200 font-medium flex items-center gap-2"
              >
                <Sparkles size={20} />
                Seleccionar Imagen
              </motion.button>
            )}
          </label>

          {isAnalyzing && (
            <div className="mt-4">
              <div className="flex items-center justify-center gap-2 text-glow-600">
                <Loader2 className="animate-spin" size={20} />
                <span className="text-sm font-medium">
                  La IA está analizando tu producto...
                </span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Selected Image Preview */}
      <AnimatePresence>
        {selectedImage && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="relative"
          >
            <div className="relative rounded-xl overflow-hidden border-2 border-glow-200">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={selectedImage.preview}
                alt="Preview"
                className="w-full h-64 object-cover"
              />

              {(isAnalyzing || isUploadingToCloud) && (
                <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                  <div className="text-center text-white">
                    <Loader2 className="animate-spin mx-auto mb-2" size={40} />
                    <p className="font-semibold">
                      {isUploadingToCloud ? 'Subiendo a Cloudinary...' : 'Analizando con IA...'}
                    </p>
                  </div>
                </div>
              )}

              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={removeImage}
                disabled={isAnalyzing || isUploadingToCloud}
                className="absolute top-2 right-2 p-2 bg-red-600 text-white rounded-full hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <X size={20} />
              </motion.button>
            </div>

            <div className="mt-4 p-4 bg-glow-50 rounded-lg border border-glow-200">
              <div className="flex items-start gap-2">
                <Sparkles className="text-glow-600 flex-shrink-0 mt-1" size={20} />
                <div>
                  <p className="text-sm font-semibold text-gray-900">
                    {selectedImage.cloudinaryUrl ? '✅ Imagen guardada en Cloudinary' : 'Análisis con IA'}
                  </p>
                  <p className="text-sm text-gray-600 mt-1">
                    {isUploadingToCloud
                      ? "Guardando imagen permanente en la nube..."
                      : isAnalyzing
                      ? "La IA está procesando la imagen y rellenará automáticamente todos los campos del producto..."
                      : selectedImage.cloudinaryUrl
                      ? "✓ Imagen analizada y guardada. Los campos se han rellenado automáticamente."
                      : "✓ Imagen analizada. Los campos se han rellenado automáticamente."}
                  </p>
                  {selectedImage.cloudinaryUrl && (
                    <p className="text-xs text-glow-600 mt-1 font-mono truncate">
                      {selectedImage.cloudinaryUrl}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Error Message */}
      {analysisError && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg"
        >
          <p className="text-sm text-red-800">
            <strong>Error:</strong> {analysisError}
          </p>
          <p className="text-xs text-red-600 mt-1">
            Puedes continuar rellenando los campos manualmente.
          </p>
        </motion.div>
      )}

      <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
        <p className="text-xs text-blue-800">
          <strong>💡 Consejo:</strong> Para mejores resultados, usa una imagen clara del
          producto sobre un fondo limpio. La IA analizará la imagen y completará
          automáticamente el nombre, descripción, categoría, beneficios, instrucciones
          e ingredientes.
        </p>
      </div>
    </div>
  );
};

export default AIImageUpload;
