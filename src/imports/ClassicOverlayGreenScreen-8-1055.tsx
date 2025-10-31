import svgPaths from "./svg-g374bx434d";
import imgSmoothGrayPlasterWall1 from "figma:asset/cdaa5ecb4c8976d227a2e168593c276ca01bc205.png";
import imgClassicOverlay from "figma:asset/72aba72fe66deff282fe810caed31045e2fc20eb.png";

function Group4() {
  return (
    <div className="absolute contents left-[-45px] top-0">
      <div className="absolute h-[1710px] left-[-45px] shadow-[0px_4px_4px_0px_rgba(0,0,0,0.25)] top-0 w-[665px]" data-name="smooth-gray-plaster-wall 1">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <img alt="" className="absolute h-full left-[-93.23%] max-w-none top-0 w-[257.14%]" src={imgSmoothGrayPlasterWall1} />
        </div>
      </div>
    </div>
  );
}

function Group3() {
  return (
    <div className="absolute h-[1208px] left-[69px] top-[109px] w-[470px]">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 470 1208">
        <g id="Group 3">
          <rect fill="var(--fill-0, #00F500)" height="299" id="Rectangle 1" width="469" />
          <rect fill="var(--fill-0, #00F500)" height="346" id="Rectangle 2" width="461" x="9" y="432" />
          <path d={svgPaths.p1c8a1700} fill="var(--fill-0, #00F500)" id="Subtract" />
        </g>
      </svg>
    </div>
  );
}

export default function ClassicOverlayGreenScreen() {
  return (
    <div className="bg-white relative size-full" data-name="classic overlay - green screen">
      <Group4 />
      <Group3 />
      <div className="absolute h-[1710px] left-[-5px] top-0 w-[625px]" data-name="classic overlay">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <img alt="" className="absolute h-[114.2%] left-[-24.52%] max-w-none top-[-3.62%] w-[124.52%]" src={imgClassicOverlay} />
        </div>
      </div>
    </div>
  );
}