import {
    decode as decodeJpeg,
    encode as encodeJpeg,
} from '@jsquash/jpeg';
import {
    decode as decodePng,
} from '@jsquash/png';
import resize from '@jsquash/resize';
import {
    encode as encodeWebp,
} from '@jsquash/webp';

const MAX_WIDTH = 2250;

async function decodeImage(file: File): Promise<any | null> {
  const imageBuffer = await file.arrayBuffer();
  let imageData: any | null = null;
  if (file.type === 'image/jpeg') {
    imageData = await decodeJpeg(imageBuffer);
  } else if (file.type === 'image/png') {
    imageData = await decodePng(imageBuffer);
  }
  return imageData;
}

async function resizeImage(imageData: any): Promise<any> {
  if (imageData.width > MAX_WIDTH) {
    const height = Math.round(imageData.height * (MAX_WIDTH / imageData.width));
    return resize(imageData, { width: MAX_WIDTH, height });
  }
  return imageData;
}

async function encodeImage(
  imageData: any,
  originalFile: File
): Promise<Blob> {
  let webpBuffer: ArrayBuffer;

  if (originalFile.type === 'image/jpeg') {
    webpBuffer = await encodeWebp(imageData, {
      quality: 75,
      effort: 4,
    } as any);
  } else { // PNG
    const losslessWebp = await encodeWebp(imageData, { lossless: 1, effort: 4 } as any);
    // This is a naive comparison, but it's a reasonable heuristic
    if (losslessWebp.byteLength < originalFile.size * 0.95) {
      webpBuffer = losslessWebp;
    } else {
      webpBuffer = await encodeWebp(imageData, { near_lossless: 80, effort: 4 } as any);
    }
  }

  const webpBlob = new Blob([webpBuffer], { type: 'image/webp' });

  // Safety net: if WebP is larger, return original as JPEG
  // (All images are converted to JPEG as a fallback to avoid complexity with PNGs)
  if (webpBlob.size > originalFile.size) {
    const jpegBuffer = await encodeJpeg(imageData, { quality: 90 });
    return new Blob([jpegBuffer], { type: 'image/jpeg' });
  }

  return webpBlob;
}


export async function processImage(file: File): Promise<Blob> {
  if (file.type === 'image/svg+xml') {
    return file;
  }

  let imageData = await decodeImage(file);
  if (!imageData) {
    // If decoding fails, return original file
    return file;
  }

  imageData = await resizeImage(imageData);
  const processedBlob = await encodeImage(imageData, file);

  return processedBlob;
} 