import { useState, useEffect } from 'react';
import { Home } from './components/Home';
import { ThemeSelection } from './components/ThemeSelection';
import { TakeUploadChoice } from './components/TakeUploadChoice';
import { CameraCapture } from './components/CameraCapture';
import { Printing } from './components/Printing';
import { Download } from './components/Download';
import { TestPhotoStrip } from './components/TestPhotoStrip';

export default function App() {
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedTheme, setSelectedTheme] = useState<'classic' | 'cuttlefish' | null>(null);
  const [capturedPhotos, setCapturedPhotos] = useState<string[]>([]);
  const [photoStripUrl, setPhotoStripUrl] = useState<string>('');
  const [testMode, setTestMode] = useState(false);

  // TEST MODE: Press 'T' key to toggle test mode
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === 't' || e.key === 'T') {
        setTestMode(!testMode);
        console.log('Test mode:', !testMode);
      }
    };
    window.addEventListener('keypress', handleKeyPress);
    return () => window.removeEventListener('keypress', handleKeyPress);
  }, [testMode]);

  const handleStart = () => {
    setCurrentPage(2);
  };

  const handleThemeSelect = (theme: 'classic' | 'cuttlefish') => {
    console.log('Theme selected:', theme);
    setSelectedTheme(theme);
    setCurrentPage(3);
  };

  const handleTakePhotos = () => {
    setCurrentPage(4);
  };

  const handleUploadPhotos = async (files: FileList) => {
    if (files.length !== 3) {
      alert('Please select exactly 3 photos');
      return;
    }

    const photoUrls: string[] = [];
    
    // Convert files to data URLs for better compatibility
    for (let i = 0; i < files.length; i++) {
      try {
        const dataUrl = await fileToDataURL(files[i]);
        photoUrls.push(dataUrl);
      } catch (error) {
        console.error(`Error converting file ${i} to data URL:`, error);
        alert('Error processing photos. Please try again.');
        return;
      }
    }
    
    setCapturedPhotos(photoUrls);
    // Skip page 4, go directly to printing
    setCurrentPage(5);
  };

  const fileToDataURL = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target?.result) {
          resolve(e.target.result as string);
        } else {
          reject(new Error('Failed to read file'));
        }
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const handlePhotosComplete = (photos: string[]) => {
    setCapturedPhotos(photos);
    setCurrentPage(5);
  };

  const handlePrintingComplete = (stripUrl: string) => {
    setPhotoStripUrl(stripUrl);
    setCurrentPage(6);
  };

  const handleHome = () => {
    // Reset all state
    setCurrentPage(1);
    setSelectedTheme(null);
    setCapturedPhotos([]);
    setPhotoStripUrl('');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#202020]">
      <div className="relative w-[402px] h-[680px] bg-white overflow-hidden">
        {currentPage === 1 && <Home onStart={handleStart} />}
        {currentPage === 2 && <ThemeSelection onThemeSelect={handleThemeSelect} />}
        {currentPage === 3 && selectedTheme && (
          <TakeUploadChoice 
            theme={selectedTheme} 
            onTakePhotos={handleTakePhotos}
            onUploadPhotos={handleUploadPhotos}
          />
        )}
        {currentPage === 4 && selectedTheme && (
          <CameraCapture 
            theme={selectedTheme}
            onComplete={handlePhotosComplete}
            onBack={() => setCurrentPage(3)}
          />
        )}
        {currentPage === 5 && selectedTheme && (
          <Printing 
            theme={selectedTheme}
            photos={capturedPhotos}
            onComplete={handlePrintingComplete}
          />
        )}
        {currentPage === 6 && (
          <Download photoStripUrl={photoStripUrl} onHome={handleHome} />
        )}
      </div>
      {testMode && (
        <div className="fixed top-0 left-0 w-full h-full bg-black bg-opacity-90 z-50 flex items-center justify-center">
          <TestPhotoStrip />
        </div>
      )}
    </div>
  );
}