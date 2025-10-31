import { useState, useRef, useEffect } from 'react';
import { Camera, SwitchCamera, Zap, ZapOff } from 'lucide-react';

interface CameraCaptureProps {
  theme: 'classic' | 'cuttlefish';
  onComplete: (photos: string[]) => void;
}

export function CameraCapture({ theme, onComplete }: CameraCaptureProps) {
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [capturedPhotos, setCapturedPhotos] = useState<string[]>([]);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [isCapturing, setIsCapturing] = useState(false);
  const [showFlash, setShowFlash] = useState(false);
  const [showCapturedPreview, setShowCapturedPreview] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('user');
  const [availableCameras, setAvailableCameras] = useState<MediaDeviceInfo[]>([]);
  const [currentDeviceId, setCurrentDeviceId] = useState<string | null>(null);
  const [zoomLevel, setZoomLevel] = useState<number>(1); // 1x or 0.5x
  const [flashEnabled, setFlashEnabled] = useState<boolean>(true); // Flash on by default
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Guide frame positions for showing where photo will be captured (scaled for 402x680 mobile view)
  const getGuideFrames = () => {
    if (theme === 'classic') {
      return [
        { x: 46, y: 120, width: 312, height: 199 },   // Top frame
        { x: 52, y: 240, width: 307, height: 230 },   // Middle frame
        { x: 53, y: 240, width: 313, height: 210 }    // Bottom frame
      ];
    } else {
      return [
        { x: 21, y: 120, width: 358, height: 278 },   // Top frame - aspect 1.29:1
        { x: 22, y: 200, width: 358, height: 278 },   // Middle frame - aspect 1.29:1
        { x: 21, y: 200, width: 358, height: 278 }    // Bottom frame - aspect 1.29:1
      ];
    }
  };

  // Get thumbnail dimensions based on theme
  const getThumbnailDimensions = () => {
    // Base height for thumbnails
    const height = 70;
    
    if (theme === 'classic') {
      // Use approximate 1.45:1 aspect ratio for all classic thumbnails (average of frames)
      const width = Math.round(height * 1.45);
      return { width, height };
    } else {
      // Cuttlefish: 1.29:1 aspect ratio
      const width = Math.round(height * 1.29);
      return { width, height };
    }
  };

  const guideFrames = getGuideFrames();
  const currentFrame = guideFrames[capturedPhotos.length] || guideFrames[0];

  useEffect(() => {
    enumerateCameras();
    startCamera();
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const enumerateCameras = async () => {
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      const videoDevices = devices.filter(device => device.kind === 'videoinput');
      setAvailableCameras(videoDevices);
    } catch (err) {
      console.error('Error enumerating cameras:', err);
    }
  };

  const startCamera = async (deviceId?: string, zoom?: number) => {
    try {
      // Stop existing stream
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }

      const currentZoom = zoom ?? zoomLevel;

      // Start with basic constraints and add complexity if supported
      let constraints: MediaStreamConstraints;
      
      if (deviceId) {
        // Specific device requested
        constraints = {
          video: { 
            deviceId: { exact: deviceId },
            zoom: currentZoom !== 1 ? currentZoom : undefined
          } as any,
          audio: false
        };
      } else {
        // Default to front camera with basic constraints
        constraints = {
          video: { 
            facingMode: facingMode,
            width: { ideal: 1280 },
            height: { ideal: 720 },
            zoom: currentZoom !== 1 ? currentZoom : undefined
          } as any,
          audio: false
        };
      }

      console.log('Requesting camera with constraints:', constraints);
      const mediaStream = await navigator.mediaDevices.getUserMedia(constraints);
      
      setStream(mediaStream);
      setError(null); // Clear any previous errors
      
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }

      // Store current device ID
      const videoTrack = mediaStream.getVideoTracks()[0];
      if (videoTrack) {
        const settings = videoTrack.getSettings();
        setCurrentDeviceId(settings.deviceId || null);
        console.log('Camera started with settings:', settings);
      }

      // Enumerate cameras after successful start (helps get device labels)
      enumerateCameras();
      
    } catch (err) {
      console.error('Camera access error:', err);
      
      if (err instanceof Error) {
        if (err.name === 'NotAllowedError') {
          setError('Camera permission denied. Please allow camera access in your browser settings and reload the page.');
        } else if (err.name === 'NotFoundError') {
          setError('No camera found on this device.');
        } else if (err.name === 'NotReadableError') {
          setError('Camera is already in use by another application.');
        } else if (err.name === 'OverconstrainedError') {
          // Try again with minimal constraints
          console.log('Over-constrained, trying with minimal constraints...');
          try {
            const minimalStream = await navigator.mediaDevices.getUserMedia({
              video: true,
              audio: false
            });
            setStream(minimalStream);
            setError(null);
            if (videoRef.current) {
              videoRef.current.srcObject = minimalStream;
            }
          } catch (fallbackErr) {
            console.error('Fallback camera request failed:', fallbackErr);
            setError('Unable to access camera. Please check your browser permissions.');
          }
        } else {
          setError(`Camera error: ${err.message}`);
        }
      } else {
        setError('Unable to access camera. Please grant camera permissions.');
      }
    }
  };

  const switchCamera = async () => {
    if (availableCameras.length <= 1) return;

    const currentIndex = availableCameras.findIndex(cam => cam.deviceId === currentDeviceId);
    const nextIndex = (currentIndex + 1) % availableCameras.length;
    const nextCamera = availableCameras[nextIndex];

    await startCamera(nextCamera.deviceId);
    
    // Toggle facing mode for reference
    setFacingMode(prev => prev === 'user' ? 'environment' : 'user');
  };

  const switchZoom = async () => {
    const newZoom = zoomLevel === 1 ? 0.5 : 1;
    setZoomLevel(newZoom);
    
    // For iOS/iPhone, we need to use different camera streams rather than zoom constraints
    // Try to get a wide-angle camera when 0.5x is selected
    if (stream && facingMode === 'user') {
      // For front camera, try to find ultra-wide if available
      const videoDevices = availableCameras.filter(device => 
        device.label.toLowerCase().includes('front') || 
        device.label.toLowerCase().includes('user')
      );
      
      if (newZoom === 0.5 && videoDevices.length > 1) {
        // Try to find wide-angle front camera
        const wideCamera = videoDevices.find(device => 
          device.label.toLowerCase().includes('wide') || 
          device.label.toLowerCase().includes('ultra')
        );
        if (wideCamera) {
          await startCamera(wideCamera.deviceId, newZoom);
          return;
        }
      }
    }
    
    // Try to apply zoom to current stream
    if (stream) {
      const videoTrack = stream.getVideoTracks()[0];
      const capabilities = videoTrack.getCapabilities() as any;
      
      if (capabilities.zoom) {
        try {
          await videoTrack.applyConstraints({
            advanced: [{ zoom: newZoom } as any]
          });
          console.log('Zoom applied:', newZoom);
          return;
        } catch (err) {
          console.log('Zoom constraint not supported, restarting camera...');
        }
      }
    }
    
    // If zoom constraint doesn't work, restart camera (some devices need this)
    await startCamera(currentDeviceId || undefined, newZoom);
  };

  const capturePhoto = () => {
    if (isCapturing || capturedPhotos.length >= 3) return;
    
    setIsCapturing(true);
    
    // Start countdown: 3, 2, 1
    let count = 3;
    setCountdown(count);
    
    const countdownInterval = setInterval(() => {
      count--;
      if (count > 0) {
        setCountdown(count);
      } else {
        clearInterval(countdownInterval);
        setCountdown(null);
        
        // Take the photo with flash effect
        takeSnapshot();
      }
    }, 1000);
  };

  const takeSnapshot = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    
    if (!video || !canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Set canvas to video dimensions
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    
    // Draw the current video frame (NO MIRRORING - draw as-is)
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    
    // Convert to data URL
    const photoDataUrl = canvas.toDataURL('image/jpeg', 0.9);
    
    const newPhotos = [...capturedPhotos, photoDataUrl];
    setCapturedPhotos(newPhotos);
    
    // Flash effect (only if enabled)
    if (flashEnabled) {
      setShowFlash(true);
      setTimeout(() => setShowFlash(false), 150);
    }
    
    // Show captured photo briefly
    setShowCapturedPreview(true);
    setTimeout(() => {
      setShowCapturedPreview(false);
      setIsCapturing(false);
    }, 800);
    
    // If we have 3 photos, automatically proceed to printing
    if (newPhotos.length === 3) {
      setTimeout(() => {
        if (stream) {
          stream.getTracks().forEach(track => track.stop());
        }
        onComplete(newPhotos);
      }, 1200);
    }
  };

  if (error) {
    return (
      <div className="flex items-center justify-center h-full bg-[#202020] text-white p-8 text-center">
        <div>
          <Camera className="w-16 h-16 mx-auto mb-4 text-red-500" />
          <p className="font-['Italianno:Regular',sans-serif] text-[24px] text-[#ff9d47]">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full bg-[#202020] overflow-hidden">
      {/* Live camera feed - full screen, MIRRORED for front camera (iPhone default behavior) */}
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className="absolute inset-0 w-full h-full object-cover"
        style={{ transform: facingMode === 'user' ? 'scaleX(-1)' : 'none' }}
      />
      
      {/* Hidden canvas for capturing photos */}
      <canvas ref={canvasRef} className="hidden" />
      
      {/* Flash effect */}
      {showFlash && (
        <div className="absolute inset-0 bg-white z-50 animate-pulse" />
      )}
      
      {/* Darkened overlay during countdown */}
      {countdown !== null && (
        <div className="absolute inset-0 bg-black/70 z-[15]" />
      )}
      
      {/* Top UI - Photo counter */}
      <div className="absolute top-6 left-0 right-0 text-center z-20">
        <p className="font-['Italianno:Regular',sans-serif] text-[36px] text-[#ff9d47] drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)]">
          Photo {capturedPhotos.length + 1} of 3
        </p>
      </div>
      
      {/* Camera controls - top right */}
      <div className="absolute top-6 right-6 z-20 flex flex-col gap-3">
        {/* Camera switch button */}
        {availableCameras.length > 1 && (
          <button
            onClick={switchCamera}
            className="w-12 h-12 rounded-full bg-black/50 border-2 border-[#ff9d47] flex items-center justify-center active:scale-95 transition-transform"
          >
            <SwitchCamera className="w-6 h-6 text-[#ff9d47]" />
          </button>
        )}
        
        {/* Zoom/Lens selector */}
        <button
          onClick={switchZoom}
          className="w-12 h-12 rounded-full bg-black/50 border-2 border-[#ff9d47] flex items-center justify-center active:scale-95 transition-transform"
        >
          <span className="font-['Italianno:Regular',sans-serif] text-[#ff9d47] text-[18px]">
            {zoomLevel}x
          </span>
        </button>
        
        {/* Flash toggle */}
        <button
          onClick={() => setFlashEnabled(!flashEnabled)}
          className="w-12 h-12 rounded-full bg-black/50 border-2 border-[#ff9d47] flex items-center justify-center active:scale-95 transition-transform"
        >
          {flashEnabled ? (
            <Zap className="w-6 h-6 text-[#ff9d47]" />
          ) : (
            <ZapOff className="w-6 h-6 text-[#ff9d47]" />
          )}
        </button>
      </div>
      
      {/* Left sidebar - Captured photo thumbnails with proper aspect ratios */}
      <div className="absolute left-3 top-24 z-20 flex flex-col gap-3">
        {capturedPhotos.map((photo, index) => {
          const { width, height } = getThumbnailDimensions();
          return (
            <div
              key={index}
              className="border-2 border-[#ff9d47] rounded shadow-lg overflow-hidden bg-black"
              style={{ width: `${width}px`, height: `${height}px` }}
            >
              <img 
                src={photo} 
                alt={`Captured ${index + 1}`}
                className="w-full h-full object-cover"
              />
            </div>
          );
        })}
        
        {/* Empty placeholders for remaining photos */}
        {[...Array(3 - capturedPhotos.length)].map((_, index) => {
          const actualIndex = capturedPhotos.length + index;
          const { width, height } = getThumbnailDimensions();
          return (
            <div
              key={`empty-${index}`}
              className="border-2 border-[#ff9d47] border-dashed rounded bg-black/30"
              style={{ width: `${width}px`, height: `${height}px` }}
            />
          );
        })}
      </div>
      
      {/* Guide frame - shows where the photo will be captured */}
      {capturedPhotos.length < 3 && !showCapturedPreview && (
        <div
          className="absolute border-4 border-[#ff9d47] z-[16] pointer-events-none transition-opacity"
          style={{
            left: `${currentFrame.x}px`,
            top: `${currentFrame.y}px`,
            width: `${currentFrame.width}px`,
            height: `${currentFrame.height}px`,
            opacity: countdown !== null ? 1 : 0.8
          }}
        />
      )}
      
      {/* "Get ready!" text during countdown */}
      {countdown !== null && (
        <div 
          className="absolute z-[20] pointer-events-none"
          style={{
            left: `${currentFrame.x + currentFrame.width / 2}px`,
            top: `${currentFrame.y - 50}px`,
            transform: 'translateX(-50%)'
          }}
        >
          <p className="font-['Italianno:Regular',sans-serif] text-[#ff9d47] text-[40px] drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)] animate-pulse whitespace-nowrap">
            Get ready!
          </p>
        </div>
      )}
      
      {/* Countdown below the guide frame with padding */}
      {countdown !== null && (
        <div
          className="absolute z-[20] pointer-events-none flex items-center justify-center"
          style={{
            left: `${currentFrame.x}px`,
            top: `${currentFrame.y + currentFrame.height + 20}px`,
            width: `${currentFrame.width}px`,
            height: '120px'
          }}
        >
          <div className="font-['Blaka:Regular',sans-serif] text-[#ff9d47] text-[120px] drop-shadow-[0_2px_12px_rgba(0,0,0,0.9)] animate-pulse leading-none py-4" style={{ width: '150px', textAlign: 'center' }}>
            {countdown}
          </div>
        </div>
      )}
      
      {/* Brief preview of captured photo with proper aspect ratio */}
      {showCapturedPreview && capturedPhotos.length > 0 && (
        <div className="absolute inset-0 bg-black/80 z-30 flex items-center justify-center">
          {(() => {
            const lastPhotoIndex = capturedPhotos.length - 1;
            const { width, height } = getThumbnailDimensions();
            const aspectRatio = width / height;
            const previewHeight = 250;
            const previewWidth = previewHeight * aspectRatio;
            
            return (
              <div 
                className="border-4 border-[#ff9d47] rounded overflow-hidden"
                style={{ width: `${previewWidth}px`, height: `${previewHeight}px` }}
              >
                <img 
                  src={capturedPhotos[lastPhotoIndex]} 
                  alt="Just captured"
                  className="w-full h-full object-cover"
                />
              </div>
            );
          })()}
        </div>
      )}
      
      {/* Bottom control area */}
      <div className="absolute bottom-0 left-0 right-0 pb-8 pt-6 bg-gradient-to-t from-black/80 to-transparent z-20">
        {/* Instruction text */}
        {!isCapturing && !showCapturedPreview && (
          <p className="text-center font-['Italianno:Regular',sans-serif] text-[#ff9d47] text-[28px] mb-3 drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)]">
            {capturedPhotos.length === 0 ? 'Tap to capture photo' : 'Tap to capture next photo'}
          </p>
        )}
        
        {isCapturing && countdown === null && (
          <p className="text-center font-['Italianno:Regular',sans-serif] text-[#ff9d47] text-[28px] mb-3 drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)]">
            Smile! 📸
          </p>
        )}
        
        {/* Capture button */}
        <div className="flex justify-center">
          <button
            onClick={capturePhoto}
            disabled={isCapturing || capturedPhotos.length >= 3}
            className="relative w-20 h-20 rounded-full bg-white border-4 border-[#ff9d47] disabled:opacity-50 disabled:cursor-not-allowed active:scale-95 transition-all shadow-lg"
          >
            {isCapturing && countdown === null && (
              <div className="absolute inset-0 rounded-full bg-[#ff9d47] animate-pulse" />
            )}
            <div className="absolute inset-2 rounded-full bg-[#ff9d47]" />
          </button>
        </div>
      </div>
    </div>
  );
}