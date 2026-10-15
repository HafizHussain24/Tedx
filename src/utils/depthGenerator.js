// =====================================================================
//  Client-side Depth Map Generator (Fallback & Custom Uploads)
//  Generates a high-quality 3D depth map from any 2D portrait
//  when an explicit depth map PNG is not provided.
// =====================================================================

export function generateProceduralDepthMap(imageElement) {
  const canvas = document.createElement('canvas');
  const w = imageElement.naturalWidth || imageElement.width || 1024;
  const h = imageElement.naturalHeight || imageElement.height || 1024;
  canvas.width = Math.min(w, 1024);
  canvas.height = Math.min(h, 1024);

  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  if (!ctx) return canvas;

  ctx.drawImage(imageElement, 0, 0, canvas.width, canvas.height);
  const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const data = imgData.data;

  const cx = canvas.width * 0.5;
  const cy = canvas.height * 0.42; // slightly above vertical center for human face
  const maxR = Math.min(canvas.width, canvas.height) * 0.55;

  for (let y = 0; y < canvas.height; y++) {
    for (let x = 0; x < canvas.width; x++) {
      const idx = (y * canvas.width + x) * 4;
      const r = data[idx];
      const g = data[idx + 1];
      const b = data[idx + 2];

      // Luminance
      const lum = (0.299 * r + 0.587 * g + 0.114 * b) / 255.0;

      // Radial distance from expected facial center
      const dx = (x - cx) / maxR;
      const dy = (y - cy) / maxR;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const radialDepth = Math.max(0.0, 1.0 - dist);

      // Smooth curve
      const faceWeight = Math.pow(radialDepth, 1.6);
      const combined = Math.min(1.0, faceWeight * 0.75 + lum * 0.25);
      const depthVal = Math.floor(combined * 255);

      data[idx] = depthVal;
      data[idx + 1] = depthVal;
      data[idx + 2] = depthVal;
      data[idx + 3] = 255;
    }
  }

  ctx.putImageData(imgData, 0, 0);
  return canvas;
}
