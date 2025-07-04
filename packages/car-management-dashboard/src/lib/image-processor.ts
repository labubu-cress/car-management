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
const WEBP_QUALITY = 85;
const WEBP_EFFORT = 5;
const WEBP_LOSSLESS_QUALITY = 1;
const WEBP_NEAR_LOSSLESS_QUALITY = 90;
const LOSSLESS_WEBP_SIZE_RATIO = 0.95;
const JPEG_FALLBACK_QUALITY = 90;

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
      quality: WEBP_QUALITY,
      effort: WEBP_EFFORT,
    } as any);
  } else { // PNG
    const losslessWebp = await encodeWebp(imageData, { lossless: WEBP_LOSSLESS_QUALITY, effort: WEBP_EFFORT } as any);
    // This is a naive comparison, but it's a reasonable heuristic
    if (losslessWebp.byteLength < originalFile.size * LOSSLESS_WEBP_SIZE_RATIO) {
      webpBuffer = losslessWebp;
    } else {
      webpBuffer = await encodeWebp(imageData, { near_lossless: WEBP_NEAR_LOSSLESS_QUALITY, effort: WEBP_EFFORT } as any);
    }
  }

  const webpBlob = new Blob([webpBuffer], { type: 'image/webp' });

  // Safety net: if WebP is larger, return original as JPEG
  // (All images are converted to JPEG as a fallback to avoid complexity with PNGs)
  if (webpBlob.size > originalFile.size) {
    const jpegBuffer = await encodeJpeg(imageData, { quality: JPEG_FALLBACK_QUALITY });
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