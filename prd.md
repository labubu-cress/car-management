# goal 
管理后台前端的图片上传功能，要做修改：
如果是  非 svg 图片，是用智能策略压缩以后再上传。

# 策略
目标：对于用户上传的非 SVG 图片，在前端通过以下流程进行处理，以生成优化后的图片文件（优先为 WebP），然后再进行上传。

**处理流程:**

1.  **解码图片**: 将用户选择的图片文件（PNG/JPEG）解码为原始像素数据 (`ImageData`)。

2.  **预处理 - 缩放**:
    *   检查图片尺寸。如果图片宽度大于一个预设的最大值（例如 `2250px`），则使用 `@jsquash/resize` 将其宽度缩减至该值，高度按比例缩放。

3.  **编码为 WebP - 根据源文件类型选择策略**:
    *   **如果源文件是 JPEG (通常是照片):**
        *   使用 **有损 WebP** (`lossy WebP`) 模式进行编码。
        *   **参数**:
            *   `quality`: `75` (在高质量和文件大小之间取得极佳平衡)。
            *   `effort`: `4` (平衡压缩速度和效果)。
    *   **如果源文件是 PNG (通常是图形、截图):**
        *   **步骤 a (首选)**: 尝试使用 **无损 WebP** (`lossless: 1`) 模式进行编码，设置 `effort: 4`。
        *   **步骤 b (备选)**: 比较步骤 a 生成的 WebP 文件和原始 PNG 文件的大小。如果 WebP 文件没有明显更小，则废弃该结果，并尝试使用 **视觉无损 WebP** (`nearLossless`) 模式重新编码。
        *   **参数**:
            *   `nearLossless`: `80` (在保留清晰边缘和细节的同时显著减小体积)。
            *   `effort`: `4`。

4.  **最终决策 - 大小比较 (安全网)**:
    *   将步骤 3 中最终生成的 WebP 文件与 **原始图片文件** 进行大小比较。
    *   如果 WebP 文件体积更小，则上传 WebP 文件。
    *   如果原始文件体积更小（在极少数情况下可能发生），则直接上传原始文件。

# task A (partial)
完成准备工作，安装库，做配置（假设有的话）；

logs:
已经找到了所有需要的 .wasm 文件。列表如下：
JPEG:
mozjpeg_dec.wasm
mozjpeg_enc.wasm
PNG:
squoosh_png_bg.wasm
WebP:
webp_dec.wasm
webp_enc.wasm
webp_enc_simd.wasm
现在，我将把所有这些文件复制到 packages/car-management-dashboard/public/ 目录下。

# task B
完成功能
