/**
 * Normalizes image URLs, specifically converting Google Drive sharing links
 * into direct, high-performance image CDN URLs that can be embedded in <img> tags.
 *
 * Supported Google Drive input formats:
 * - https://drive.google.com/file/d/{FILE_ID}/view?usp=sharing
 * - https://drive.google.com/file/d/{FILE_ID}/view
 * - https://drive.google.com/open?id={FILE_ID}
 * - https://drive.google.com/uc?id={FILE_ID}
 * - https://drive.google.com/uc?export=view&id={FILE_ID}
 *
 * Converted to:
 * - https://lh3.googleusercontent.com/d/{FILE_ID}
 */
export function formatDriveImageUrl(url) {
  if (!url || typeof url !== "string") return url || "";
  const trimmed = url.trim();

  // Match Google Drive file ID
  const driveMatch =
    trimmed.match(/\/file\/d\/([a-zA-Z0-9_-]+)/) ||
    trimmed.match(/[?&]id=([a-zA-Z0-9_-]+)/);

  if (driveMatch && driveMatch[1]) {
    const fileId = driveMatch[1];
    return `https://lh3.googleusercontent.com/d/${fileId}`;
  }

  return trimmed;
}
