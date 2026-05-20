const PLACEHOLDER_SVG = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="1280" height="720" viewBox="0 0 1280 720" role="img" aria-label="Preview unavailable">
  <rect fill="#111020" width="100%" height="100%"/>
  <text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="#8B89A8" font-family="system-ui,Segoe UI,sans-serif" font-size="22">Preview unavailable</text>
</svg>`;

export function websiteScreenshotPlaceholderResponse(): Response {
  return new Response(PLACEHOLDER_SVG, {
    status: 200,
    headers: {
      'Content-Type': 'image/svg+xml; charset=utf-8',
      'Cache-Control': 'public, max-age=60',
    },
  });
}
