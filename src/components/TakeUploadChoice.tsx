import TakeUploadClassicComponent from '../imports/3TakeUploadIfChoseClassicThemeOverlay';
import TakeUploadCuttlefishComponent from '../imports/3TakeUploadIfChoseCuttlefishThemeOverlay';
import { useRef } from 'react';

interface TakeUploadChoiceProps {
  theme: 'classic' | 'cuttlefish';
  onTakePhotos: () => void;
  onUploadPhotos: (files: FileList) => void;
}

export function TakeUploadChoice({ theme, onTakePhotos, onUploadPhotos }: TakeUploadChoiceProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const y = e.clientY - rect.top;
    
    // Take photos button: top-[303px] height 58px = y: 303-361
    // Upload photos button: top-[377px] height 58px = y: 377-435
    if (y >= 303 && y <= 361) {
      onTakePhotos();
    } else if (y >= 377 && y <= 435) {
      fileInputRef.current?.click();
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length === 3) {
      onUploadPhotos(e.target.files);
    } else {
      alert('Please select exactly 3 photos');
    }
  };

  return (
    <div className="relative w-full h-full cursor-pointer" onClick={handleClick}>
      {theme === 'classic' ? (
        <TakeUploadClassicComponent />
      ) : (
        <TakeUploadCuttlefishComponent />
      )}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={handleFileChange}
      />
    </div>
  );
}