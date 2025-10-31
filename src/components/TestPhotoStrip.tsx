import { useEffect, useRef } from 'react';

export function TestPhotoStrip() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    generateTestStrips();
  }, []);

  const generateTestStrips = async () => {
    await generateTestStrip('classic');
    await generateTestStrip('cuttlefish');
  };

  const generateTestStrip = async (theme: 'classic' | 'cuttlefish') => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    console.log(`\n=== TESTING ${theme.toUpperCase()} PHOTOSTRIP ===`);

    // Set canvas dimensions to EXACT final output size (604x1710)
    canvas.width = 604;
    canvas.height = 1710;

    // Fill with white background
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Define photo positions based on the green screen reference overlays
    let photoPositions;
    if (theme === 'classic') {
      photoPositions = [
        { x: 69, y: 109, width: 469, height: 299 },      // Top frame
        { x: 78, y: 541, width: 461, height: 346 },      // Middle frame
        { x: 80, y: 1001, width: 470, height: 316 }      // Bottom frame (corrected height to 316)
      ];
    } else {
      photoPositions = [
        { x: 32, y: 58, width: 538, height: 418 },       // Top frame
        { x: 33, y: 507, width: 538, height: 418 },      // Middle frame
        { x: 32, y: 956, width: 538, height: 418 }       // Bottom frame
      ];
    }

    // Draw GREEN rectangles where photos should go
    ctx.fillStyle = '#00FF00';
    photoPositions.forEach((pos, i) => {
      ctx.fillRect(pos.x, pos.y, pos.width, pos.height);
      console.log(`Frame ${i + 1}:`, pos);
    });

    // Load and draw the overlay
    try {
      if (theme === 'classic') {
        const imgClassicOverlay = await import('figma:asset/72aba72fe66deff282fe810caed31045e2fc20eb.png');
        const overlayImg = await loadImage(imgClassicOverlay.default);
        
        console.log('Classic overlay dimensions:', overlayImg.width, 'x', overlayImg.height);
        ctx.drawImage(overlayImg, 0, 0, 604, 1710);
      } else {
        // Cuttlefish overlay - crop 2px from right and 2px from bottom
        const imgCuttleOverlay = await import('figma:asset/7168be5732ebbf43ae8c6eaf553b1d3e6ad260ec.png');
        const overlayImg = await loadImage(imgCuttleOverlay.default);
        
        console.log('Cuttlefish overlay dimensions:', overlayImg.width, 'x', overlayImg.height);
        // Crop 2px from right and bottom of source image
        ctx.drawImage(
          overlayImg,
          0, 0, overlayImg.width - 2, overlayImg.height - 2,  // Source: crop 2px
          0, 0, 604, 1710  // Destination: scale to full canvas
        );
      }
    } catch (error) {
      console.error('Error loading overlay:', error);
    }

    // Output the result
    const dataUrl = canvas.toDataURL('image/png');
    console.log(`${theme} photostrip generated (${dataUrl.length} chars)`);
    console.log(`Canvas size: ${canvas.width}x${canvas.height}`);
    
    // Download for inspection
    const link = document.createElement('a');
    link.download = `test-${theme}-photostrip.png`;
    link.href = dataUrl;
    link.click();
  };

  const loadImage = (src: string): Promise<HTMLImageElement> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = src;
    });
  };

  return (
    <div className="p-4">
      <h2 className="text-white mb-4">Testing Photo Strip Generation...</h2>
      <p className="text-white text-sm">Check console and downloads for test results</p>
      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
}