好的，我们来深入探讨一下如何使用 `@jsquash` 系列库（`@jsquash/webp`, `@jsquash/png`, `@jsquash/jpeg`）对图片进行 WebP 转换和视觉无损压缩的最佳实践策略。

这个策略的核心思想是：**根据源图片类型和内容，选择最优的 WebP 编码模式，并在编码前进行适当的预处理（如缩放），以在保持极高质量的同时，最大限度地减小文件体积。**

-----

### 核心概念：什么是“视觉无损”？

首先，要明确“视觉无损”（Visually Lossless）不等于“数据无损”（Data Lossless）。

  * **数据无损**：压缩和解压后的文件数据与原始文件完全一致，没有任何信息丢失。WebP 的 `lossless: 1` 模式就是数据无损。
  * **视觉无损**：这是一种高质量的有损压缩。它会丢失一部分人眼难以察觉的数据，使得在视觉上看起来和原图几乎没有差异，但文件体积可以显著减小。这通常对应 WebP 的高 `quality` 设置（例如 75-90）。WebP 还有一个专门的 `nearLossless` 模式，非常适合这个场景。

### 最佳实践策略流程

下面是一个完整的处理流程和决策树，你可以将其封装成一个通用的图片处理函数。

#### 第 1 步：解码源图片

无论源图片是 PNG、JPEG 还是其他格式，第一步总是将其解码为统一的、未压缩的像素数据格式（`ImageData`）。

  * 对于 JPEG 图片，使用 `@jsquash/jpeg` 的 `decode`。
  * 对于 PNG 图片，使用 `@jsquash/png` 的 `decode`。

<!-- end list -->

```javascript
import { decode as decodeJpeg } from '@jsquash/jpeg';
import { decode as decodePng } from '@jsquash/png';

async function decodeImage(imageBuffer, mimeType) {
  let imageData;
  if (mimeType === 'image/jpeg') {
    imageData = await decodeJpeg(imageBuffer);
  } else if (mimeType === 'image/png') {
    imageData = await decodePng(imageBuffer);
  } else {
    throw new Error(`Unsupported mimeType: ${mimeType}`);
  }
  return imageData;
}
```

#### 第 2 步：预处理 - 调整尺寸（关键步骤）

**这是最重要的优化步骤，甚至比压缩参数的选择更重要。** 如果一张图片在网页上只会以 800px 的宽度显示，那么发送一张 4000px 宽的原图就是巨大的浪费。在编码为 WebP 之前，先将图片缩放到实际需要的最大尺寸。

`@jsquash/resize` 是完成这个任务的理想工具。

```javascript
import { resize } from '@jsquash/resize';

async function preprocessImage(imageData, options) {
  // 举例：如果需要，将图片宽度调整为 1200px，高度按比例缩放
  if (options.resize && imageData.width > options.resize.width) {
    return await resize(imageData, {
      width: options.resize.width,
    });
  }
  return imageData;
}
```

#### 第 3 步：编码为 WebP - 决策与执行

这是策略的核心。你需要根据原始图片的特点来选择最佳的 WebP 编码参数。

##### 策略 A：针对照片类图片（通常来自 JPEG）

这类图片色彩丰富、细节复杂，没有大面积的纯色块或尖锐边缘。

**最佳选择：有损 WebP（Lossy WebP）**

  * `quality`: **75-85**。这是一个黄金范围。
      * `75` 是一个非常好的起点，它能在几乎不损失视觉质量的情况下，大幅减小文件体积（通常比原始 JPEG 小 25-50%）。
      * 对于需要极高质量的场景（如作品展示），可以提高到 `80-85`。高于 90 的收益很小，但体积会急剧增加。
  * `effort`: **4-6**。这个参数控制编码速度和压缩率的平衡。
      * `4` 是一个很好的默认值，在压缩效果和速度之间取得了良好平衡。
      * 如果是在构建过程（build time）或服务器端进行，可以设置为 `6`，以换取极致的压缩率，因为耗时不成问题。
      * 如果是在浏览器客户端实时处理，可以考虑 `2-3` 以避免阻塞主线程。

##### 策略 B：针对图形、Logo、截图、图表类图片（通常来自 PNG）

这类图片通常包含大面积纯色、清晰的线条、文本和/或透明背景。

**最佳选择：优先尝试无损 WebP，其次是 Near-Lossless 或高质量有损 WebP。**

1.  **首选：`lossless: 1`（数据无损模式）**

      * 对于这类图片，WebP 的无损模式通常比 PNG 的压缩效果更好（体积更小）。它能完美保留所有细节和透明度。
      * `effort`: 同样建议 `4-6`，以获得更好的压缩。

2.  **备选 1：`nearLossless`（视觉无损模式）**

      * 如果 `lossless: 1` 生成的文件仍然偏大，`nearLossless` 是一个绝佳的选择。它在无损的基础上进行微小的、人眼难以察觉的量化处理，可以显著减小文件体积。
      * `nearLossless` 的值域是 `0-100`，代表质量等级。`100` 是最高质量。可以从 `80-95` 开始尝试。

3.  **备选 2：高质量有损模式**

      * 如果图片包含一些渐变或者半透明的复杂区域，有时高质量的有损模式效果更好。
      * `quality`: **85-95**。由于这类图片对噪点和块状瑕疵更敏感，所以 `quality` 值需要比照片类更高。
      * **务必保留 Alpha 通道**：WebP 的有损模式也支持高质量的 Alpha 透明通道，这是它相对于 JPEG 的巨大优势。

-----

### 综合代码实践

下面是一个将以上策略结合起来的 TypeScript/JavaScript 示例函数：

```typescript
import { decode as decodeJpeg } from '@jsquash/jpeg';
import { decode as decodePng } from '@jsquash/png';
import { encode as encodeWebp, type WebPEncodeOptions } from '@jsquash/webp';
import { resize } from '@jsquash/resize';
import type { ImageData } from '@jsquash/generic';

// 定义图片类型
type ImageType = 'photograph' | 'graphic';

// 定义处理选项
interface ProcessOptions {
  type: ImageType; // 告诉函数如何优化
  resize?: {
    width: number; // 目标宽度
  };
}

/**
 * Encodes an image buffer to visually lossless WebP using best practices.
 * @param imageBuffer The source image buffer (e.g., from fs.readFile or fetch).
 * @param mimeType The mime type of the source image ('image/jpeg' or 'image/png').
 * @param options Processing options.
 * @returns A promise that resolves to the WebP image buffer.
 */
export async function processImageToWebp(
  imageBuffer: ArrayBuffer,
  mimeType: 'image/jpeg' | 'image/png',
  options: ProcessOptions,
): Promise<ArrayBuffer> {
  // 1. Decode the source image
  let imageData: ImageData;
  if (mimeType === 'image/jpeg') {
    imageData = await decodeJpeg(imageBuffer);
  } else {
    imageData = await decodePng(imageBuffer);
  }

  // 2. Pre-process: Resize if needed (CRITICAL STEP)
  if (options.resize && imageData.width > options.resize.width) {
    console.log(`Resizing image from ${imageData.width}px to ${options.resize.width}px width.`);
    imageData = await resize(imageData, { width: options.resize.width });
  }

  // 3. Encode to WebP with the best strategy
  let webpOptions: WebPEncodeOptions;

  if (options.type === 'photograph') {
    // Strategy A for photos (from JPEG)
    console.log('Using "photograph" strategy: lossy WebP, quality 75.');
    webpOptions = {
      quality: 75,
      effort: 4,
    };
  } else {
    // Strategy B for graphics (from PNG)
    // Here we could add logic to try lossless first, check size, then try nearLossless.
    // For simplicity, we'll directly use nearLossless as a great general choice.
    console.log('Using "graphic" strategy: near-lossless WebP, quality 80.');
    webpOptions = {
      nearLossless: 80, // Excellent for graphics, preserving edges while reducing size
      effort: 4,
    };
    // As an alternative for pure lossless:
    // webpOptions = {
    //   lossless: 1,
    //   effort: 6,
    // };
  }

  console.log('Encoding to WebP with options:', webpOptions);
  const webpBuffer = await encodeWebp(imageData, webpOptions);

  return webpBuffer;
}

// --- 使用示例 ---
// 假设你已经从文件或网络获取了图片 buffer
// import { promises as fs } from 'fs';
// const jpegBuffer = await fs.readFile('path/to/photo.jpg');
// const pngBuffer = await fs.readFile('path/to/logo.png');

// const processedPhoto = await processImageToWebp(jpegBuffer, 'image/jpeg', {
//   type: 'photograph',
//   resize: { width: 1280 },
// });
// await fs.writeFile('path/to/photo.webp', Buffer.from(processedPhoto));

// const processedLogo = await processImageToWebp(pngBuffer, 'image/png', {
//   type: 'graphic',
//   resize: { width: 300 },
// });
// await fs.writeFile('path/to/logo.webp', Buffer.from(processedLogo));
```

### 总结：最佳实践清单

1.  **先缩放，后压缩**：永远在编码前将图片调整到所需的最大显示尺寸。
2.  **识别图片内容**：判断图片是“照片”还是“图形”，这是选择编码策略的基础。
3.  **照片用有损（Lossy）**：使用 `quality: 75` 作为高质量和高性能的基准点。服务器端构建时可用更高的 `effort` (如 `6`)。
4.  **图形用无损（Lossless）或近无损（Near-Lossless）**：
      * 优先尝试 `lossless: 1`。
      * 如果文件过大，`nearLossless: 80-95` 是一个完美的“视觉无损”方案，能极好地保留边缘和透明度。
5.  **自动化**：将上述逻辑封装成一个可重用的函数，传入原始图片 Buffer 和图片类型，即可自动化完成整个优化流程。
6.  **环境考虑**：`@jsquash` 可以在浏览器、Node.js、Deno、Cloudflare Workers 等多种环境中运行。根据运行环境调整 `effort` 参数，以平衡处理时间和压缩效果。例如，在客户端进行实时转换时，应使用较低的 `effort` 以免影响用户体验。

遵循以上策略，你可以利用 `@jsquash` 构建一个高效、现代化的图片优化管道，显著提升网站或应用加载性能。