import Theme2Component from '../imports/2Theme';

interface ThemeSelectionProps {
  onThemeSelect: (theme: 'classic' | 'cuttlefish') => void;
}

export function ThemeSelection({ onThemeSelect }: ThemeSelectionProps) {
  return (
    <div className="relative w-full h-full">
      <Theme2Component />
      
      {/* Classic theme clickable area - positioned over the left preview */}
      <div 
        className="absolute left-[21px] top-[169px] w-[161px] h-[441px] cursor-pointer z-10"
        onClick={() => onThemeSelect('classic')}
      />
      
      {/* Cuttlefish theme clickable area - positioned over the right preview */}
      <div 
        className="absolute left-[222px] top-[169px] w-[161px] h-[441px] cursor-pointer z-10"
        onClick={() => onThemeSelect('cuttlefish')}
      />
    </div>
  );
}