import { put } from '@vercel/blob';
import { NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: 'Nenalezen žádný soubor k nahrání' }, { status: 400 });
    }

    // LOKÁLNÍ VÝVOJ: Pokud nemáme Vercel Blob token, uložíme soubor lokálně do adresáře public/uploads
    if (!process.env.BLOB_READ_WRITE_TOKEN) {
      console.log('Chybí Vercel Blob token, nahrávám lokálně do /public/uploads');
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);
      
      const uploadDir = join(process.cwd(), 'public', 'uploads');
      try {
        await mkdir(uploadDir, { recursive: true });
      } catch (e) {} // Ignorujeme chybu, pokud složka už existuje

      const uniqueName = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
      const path = join(uploadDir, uniqueName);
      
      await writeFile(path, buffer);
      return NextResponse.json({ url: `/uploads/${uniqueName}` });
    }

    const blob = await put(file.name, file, { access: 'public' });

    return NextResponse.json({ url: blob.url });
  } catch (error: any) {
    console.error('Vercel Blob Upload Error:', error.message || error);
    return NextResponse.json({ error: 'Nahrávání selhalo', details: error.message }, { status: 500 });
  }
}
