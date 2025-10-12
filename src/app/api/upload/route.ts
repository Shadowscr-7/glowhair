import { NextRequest, NextResponse } from 'next/server';
import cloudinary from '@/lib/cloudinary';

export async function POST(request: NextRequest) {
  try {
    console.log('🔵 POST /api/upload - Inicio');
    
    const formData = await request.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      console.error('❌ No se proporcionó archivo');
      return NextResponse.json({ 
        success: false,
        error: 'No file provided' 
      }, { status: 400 });
    }

    console.log('📦 Archivo recibido:');
    console.log('  - Nombre:', file.name);
    console.log('  - Tipo:', file.type);
    console.log('  - Tamaño:', `${(file.size / 1024 / 1024).toFixed(2)} MB`);

    // Convert file to base64
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const base64String = `data:${file.type};base64,${buffer.toString('base64')}`;

    console.log('📤 Subiendo a Cloudinary...');

    // Upload to Cloudinary
    const result = await cloudinary.uploader.upload(base64String, {
      folder: 'glowhair/products',
      resource_type: 'image',
      transformation: [
        { width: 1000, height: 1000, crop: 'limit' }, // Max 1000x1000
        { quality: 'auto' },
        { fetch_format: 'auto' }
      ]
    });

    console.log('✅ Imagen subida exitosamente:');
    console.log('  - URL:', result.secure_url);
    console.log('  - Public ID:', result.public_id);
    console.log('  - Dimensiones:', `${result.width}x${result.height}`);

    return NextResponse.json({
      success: true,
      url: result.secure_url,
      public_id: result.public_id,
      width: result.width,
      height: result.height,
      format: result.format
    });

  } catch (error) {
    console.error('❌ Error en POST /api/upload:', error);
    console.error('Stack:', error instanceof Error ? error.stack : 'No stack');
    return NextResponse.json(
      { 
        success: false,
        error: error instanceof Error ? error.message : 'Failed to upload image'
      }, 
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const publicId = searchParams.get('public_id');
    
    if (!publicId) {
      return NextResponse.json({ error: 'No public_id provided' }, { status: 400 });
    }

    // Delete from Cloudinary
    const result = await cloudinary.uploader.destroy(publicId);

    return NextResponse.json({
      success: true,
      result: result.result
    });

  } catch (error) {
    console.error('Cloudinary delete error:', error);
    return NextResponse.json(
      { error: 'Failed to delete image' }, 
      { status: 500 }
    );
  }
}