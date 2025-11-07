# PWA Icons Required

This PWA implementation requires the following icon files to be placed in the `public/` directory:

## Required Icon Files

- `icon-192x192.png` - 192x192px icon (any purpose)
- `icon-512x512.png` - 512x512px icon (any purpose)
- `icon-192x192-maskable.png` - 192x192px maskable icon
- `icon-512x512-maskable.png` - 512x512px maskable icon

## Generating Icons

You can use the following tools to generate PWA icons:

1. **RealFaviconGenerator**: https://realfavicongenerator.net/
2. **PWA Asset Generator**: https://github.com/elegantapp/pwa-asset-generator

## Icon Specifications

### Standard Icons (any purpose)

- Use your app logo with transparent or colored background
- Should look good on any background color
- Export as PNG with the specified dimensions

### Maskable Icons

- Must include a safe zone (inner 80% of the image)
- Logo should be centered with padding
- Background should be opaque (not transparent)
- Use https://maskable.app/ to test your maskable icons

## Temporary Placeholder

Until proper icons are created, you can:

1. Create simple placeholder icons using an image editor
2. Or use the existing favicon if one exists
3. Or use a solid color square with the app initial letter
