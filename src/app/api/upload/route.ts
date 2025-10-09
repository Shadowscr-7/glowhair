import { NextRequest, NextResponse } from 'next/server';
import cloudinary from '@/lib/cloudinary';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // Convert file to base64
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const base64String = `data:${file.type};base64,${buffer.toString('base64')}`;

    // Upload to Cloudinary
    const result = await cloudinary.uploader.upload(base64String, {
      folder: 'glowhair',
      resource_type: 'image',
      transformation: [
        { quality: 'auto' },
        { fetch_format: 'auto' }
      ]
    });

    return NextResponse.json({
      success: true,
      url: result.secure_url,
      public_id: result.public_id,
      width: result.width,
      height: result.height
    });

  } catch (error) {
    console.error('Cloudinary upload error:', error);
    return NextResponse.json(
      { error: 'Failed to upload image' }, 
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