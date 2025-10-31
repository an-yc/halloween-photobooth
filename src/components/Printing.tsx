import { useState, useEffect, useRef } from 'react';
import Component5Printing from '../imports/5Printing-6-827';

interface PrintingProps {
  theme: 'classic' | 'cuttlefish';
  photos: string[];
  onComplete: (photoStripUrl: string) => void;
}

export function Printing({ theme, photos, onComplete }: PrintingProps) {
  const [animationProgress, setAnimationProgress] = useState(0);
  const [stripGenerated, setStripGenerated] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const photoStripRef = useRef<string>('');

  useEffect(() => {
    // Generate the photo strip first
    generatePhotoStrip();
  }, []);

  useEffect(() => {
    // Only start animation after strip is generated
    if (stripGenerated) {
      // Wait 0.8 seconds before starting the animation
      setTimeout(() => {
        // Animate the dropdown over 3 seconds (increased for better visibility)
        const duration = 3000;
        const startTime = Date.now();
        
        const animate = () => {
          const elapsed = Date.now() - startTime;
          const progress = Math.min(elapsed / duration, 1);
          
          // Ease-out animation
          const easedProgress = 1 - Math.pow(1 - progress, 3);
          setAnimationProgress(easedProgress);
          
          if (progress < 1) {
            requestAnimationFrame(animate);
          } else {
            // Animation complete, wait 1 second then go to download page
            setTimeout(() => {
              onComplete(photoStripRef.current);
            }, 1000);
          }
        };
        
        requestAnimationFrame(animate);
      }, 800); // 0.8 second delay before animation starts
    }
  }, [stripGenerated]);

  const generatePhotoStrip = async () => {
    const canvas = canvasRef.current;
    if (!canvas) {
      console.error('Canvas not found');
      return;
    }

    const ctx = canvas.getContext('2d');
    if (!ctx) {
      console.error('Canvas context not available');
      return;
    }

    console.log('=== PHOTO STRIP GENERATION START ===');
    console.log('Theme:', theme);
    console.log('Number of photos:', photos.length);

    // Set canvas dimensions to EXACT final output size (604x1710)
    canvas.width = 604;
    canvas.height = 1710;

    // Fill with white background
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    console.log('Canvas initialized: 604x1710');

    // Define photo positions from the green screen overlays
    let photoPositions;
    if (theme === 'classic') {
      // From ClassicOverlayGreenScreen-8-1055.tsx
      // Group3 is at left-[69px] top-[109px] with size 470x1208
      // Contains:
      //   Rectangle 1: 469x299 at (0,0) -> absolute (69, 109)
      //   Rectangle 2: 461x346 at (9, 432) -> absolute (78, 541)
      //   Subtract path: Bottom frame with height 316 to match green screen
      photoPositions = [
        { x: 69, y: 109, width: 469, height: 299 },
        { x: 78, y: 541, width: 461, height: 346 },
        { x: 80, y: 1001, width: 470, height: 316 }  // Bottom frame (corrected height to 316)
      ];
    } else {
      // From CuttlefishOverlayGreenScreen-7-1016.tsx - direct positions
      photoPositions = [
        { x: 32, y: 58, width: 538, height: 418 },
        { x: 33, y: 507, width: 538, height: 418 },
        { x: 32, y: 956, width: 538, height: 418 }
      ];
    }

    console.log('Photo positions:', photoPositions);

    // Draw photos with proper aspect ratio and centering
    for (let i = 0; i < Math.min(photos.length, 3); i++) {
      try {
        console.log(`Loading photo ${i + 1}...`);
        const photoImg = await loadImage(photos[i]);
        console.log(`Photo ${i + 1} loaded: ${photoImg.width}x${photoImg.height}`);
        
        const pos = photoPositions[i];

        // Calculate scaling to cover the area while maintaining aspect ratio
        const scaleX = pos.width / photoImg.width;
        const scaleY = pos.height / photoImg.height;
        const scale = Math.max(scaleX, scaleY);

        const drawWidth = photoImg.width * scale;
        const drawHeight = photoImg.height * scale;

        // Center the image in the position
        const offsetX = (pos.width - drawWidth) / 2;
        const offsetY = (pos.height - drawHeight) / 2;

        console.log(`Drawing photo ${i + 1} - scale: ${scale.toFixed(2)}, offset: (${offsetX.toFixed(1)}, ${offsetY.toFixed(1)})`);

        // Use clip to ensure photo stays within bounds
        ctx.save();
        ctx.beginPath();
        ctx.rect(pos.x, pos.y, pos.width, pos.height);
        ctx.clip();
        ctx.drawImage(
          photoImg,
          pos.x + offsetX,
          pos.y + offsetY,
          drawWidth,
          drawHeight
        );
        ctx.restore();
        console.log(`Photo ${i + 1} drawn successfully`);
      } catch (error) {
        console.error(`Error loading photo ${i}:`, error);
      }
    }

    // Draw the overlay on top - PROPERLY SCALED TO 604x1710
    console.log('Drawing overlay...');
    await drawOverlayImage(ctx, theme);

    // Save the final photo strip
    photoStripRef.current = canvas.toDataURL('image/jpeg', 0.95);
    console.log('Photo strip generated successfully');
    console.log('Final dimensions:', canvas.width, 'x', canvas.height);
    console.log('=== PHOTO STRIP GENERATION COMPLETE ===');
    setStripGenerated(true);
  };

  const drawOverlayImage = async (ctx: CanvasRenderingContext2D, theme: string) => {
    try {
      if (theme === 'classic') {
        // Use the NEW classic overlay PNG (NOT the old one)
        const imgClassicOverlay = await import('figma:asset/74c41db96f34aac5a0b361abae6cf1ddf01ee7c3.png');
        const overlayImg = await loadImage(imgClassicOverlay.default);
        
        console.log('Classic overlay source:', overlayImg.width, 'x', overlayImg.height);
        
        // Scale the overlay to fit 604x1710
        ctx.drawImage(overlayImg, 0, 0, 604, 1710);
        
      } else {
        // Cuttlefish overlay - crop 2px from right and 2px from bottom to eliminate white space
        const imgCuttleOverlay = await import('figma:asset/7168be5732ebbf43ae8c6eaf553b1d3e6ad260ec.png');
        const overlayImg = await loadImage(imgCuttleOverlay.default);
        
        console.log('Cuttlefish overlay source:', overlayImg.width, 'x', overlayImg.height);
        
        // Draw the overlay but crop 2px from right and 2px from bottom
        // Use drawImage with source rectangle to crop the original image
        ctx.drawImage(
          overlayImg,
          0, 0, overlayImg.width - 2, overlayImg.height - 2,  // Source: crop 2px from right & bottom
          0, 0, 604, 1710  // Destination: scale to full canvas
        );
      }
      
      console.log('Overlay drawn to 604x1710');
    } catch (error) {
      console.error('Error loading overlay image:', error);
    }
  };

  const loadImage = (src: string): Promise<HTMLImageElement> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      if (!src.startsWith('data:')) {
        img.crossOrigin = 'anonymous';
      }
      img.onload = () => resolve(img);
      img.onerror = (e) => {
        console.error('Image load error:', e);
        reject(e);
      };
      img.src = src;
    });
  };

  // Calculate the dropdown position based on animation progress
  const startY = -473;
  const endY = 169;
  const currentY = startY + (endY - startY) * animationProgress;

  return (
    <div className="relative w-full h-full overflow-hidden">
      {/* Background with photo tray */}
      <Component5Printing />
      
      {/* Hide the static classic photo strip from the imported component */}
      <div className="absolute left-[36px] top-[-473px] w-[167.193px] h-[473.344px] bg-[#202020] z-10" />
      
      {/* Blinking light overlay - red to green */}
      <div className="absolute left-[61px] size-[8px] top-[186px] animate-blink-color z-20">
        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 8 8">
          <circle cx="4" cy="4" fill="currentColor" r="4" />
        </svg>
      </div>
      
      {/* Hidden canvas for generating the photo strip */}
      <canvas ref={canvasRef} className="hidden" />
      
      {/* Photo tray container with white border - acts as mask */}
      <div className="absolute bg-[#202020] h-[400px] left-[81px] overflow-hidden top-[232px] w-[240px] z-15">
        {/* Animated photo strip dropping down - CENTERED and MASKED */}
        {stripGenerated && photoStripRef.current && (
          <div 
            className="absolute w-[167.193px] h-[473.344px]"
            style={{
              left: `${(240 - 167.193) / 2}px`,
              top: `${currentY - 232}px`,
            }}
          >
            <img 
              src={photoStripRef.current} 
              alt="Photo strip" 
              className="w-full h-full object-cover shadow-[0px_1.107px_1.107px_0px_rgba(0,0,0,0.25)]"
            />
          </div>
        )}
        
        {/* White border inset shadow overlay */}
        <div className="absolute inset-0 pointer-events-none shadow-[0px_4px_6px_4px_inset_#ffffff]" />
      </div>

      <style jsx>{`
        @keyframes blinkColor {
          0%, 100% { color: #ef4444; }
          50% { color: #22c55e; }
        }
        .animate-blink-color {
          animation: blinkColor 1s infinite;
        }
      `}</style>
    </div>
  );
}