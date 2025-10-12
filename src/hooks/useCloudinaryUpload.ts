import { useState } from 'react';

interface UseCloudinaryUploadProps {
  onSuccess?: (url: string, publicId: string) => void;
  onError?: (error: string) => void;
}

export const useCloudinaryUpload = ({ onSuccess, onError }: UseCloudinaryUploadProps = {}) => {
  const [uploading, setUploading] = useState(false);
  const [uploadedImages, setUploadedImages] = useState<Array<{
    url: string;
    publicId: string;
    id: string;
  }>>([]);

  const uploadImage = async (file: File): Promise<string | null> => {
    setUploading(true);
    
    try {
      console.log('📤 Subiendo imagen a Cloudinary vía API...');
      console.log('  - File:', file.name, `(${(file.size / 1024 / 1024).toFixed(2)} MB)`);

      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Error desconocido' }));
        console.error('❌ Error de la API:', errorData);
        throw new Error(errorData.error || 'Error al subir la imagen');
      }

      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.error || 'Upload failed');
      }
      
      console.log('✅ Imagen subida exitosamente:');
      console.log('  - URL:', data.url);
      console.log('  - Public ID:', data.public_id);
      console.log('  - Dimensiones:', `${data.width}x${data.height}`);

      const newImage = {
        url: data.url,
        publicId: data.public_id,
        id: data.public_id
      };
      
      setUploadedImages(prev => [...prev, newImage]);
      onSuccess?.(data.url, data.public_id);
      
      return data.url;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error al subir imagen';
      console.error('❌ Error uploading to Cloudinary:', error);
      onError?.(errorMessage);
      return null;
    } finally {
      setUploading(false);
    }
  };

  const deleteImage = async (publicId: string): Promise<boolean> => {
    try {
      const response = await fetch(`/api/upload?public_id=${publicId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Delete failed');
      }

      const data = await response.json();
      
      if (data.success) {
        setUploadedImages(prev => prev.filter(img => img.publicId !== publicId));
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Delete error:', error);
      return false;
    }
  };

  const clearImages = () => {
    setUploadedImages([]);
  };

  return {
    uploading,
    uploadedImages,
    uploadImage,
    deleteImage,
    clearImages
  };
};
