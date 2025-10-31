import img1 from "figma:asset/bd4b10cd22134a22c37c0c66f20550b90473d2e9.png";
import img3 from "figma:asset/25c3aa0cfa4fc8d628a3b83401b4f736601c7ffd.png";
import img4 from "figma:asset/cdaa5ecb4c8976d227a2e168593c276ca01bc205.png";
import img5 from "figma:asset/0613169b4897f76e2a17b29b70bb2af8aa5f158b.png";
import img6 from "figma:asset/72aba72fe66deff282fe810caed31045e2fc20eb.png";
import { img, img2 } from "./svg-yb7oi";

function MaskGroup() {
  return (
    <div className="absolute contents left-[22.14px] top-[277.09px]" data-name="Mask group">
      <div className="absolute h-[129.595px] left-[18px] mask-alpha mask-intersect mask-no-clip mask-no-repeat mask-position-[4.145px_9.086px] mask-size-[123.733px_87.472px] top-[268px] w-[131px]" data-name="image 4" style={{ maskImage: `url('${img}')` }}>
        <img alt="" className="absolute inset-0 max-w-none object-50%-50% object-cover pointer-events-none size-full" src={img1} />
      </div>
    </div>
  );
}

function MaskGroup1() {
  return (
    <div className="absolute contents left-[21.59px] top-[149.75px]" data-name="Mask group">
      <div className="absolute h-[100px] left-[18px] mask-alpha mask-intersect mask-no-clip mask-no-repeat mask-position-[3.591px_1.754px] mask-size-[127.609px_95.776px] top-[148px] w-[134px]" data-name="image 3" style={{ maskImage: `url('${img2}')` }}>
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <img alt="" className="absolute h-[104.19%] left-0 max-w-none top-0 w-full" src={img3} />
        </div>
      </div>
    </div>
  );
}

function Classic() {
  return (
    <div className="absolute bg-white h-[473.344px] left-[36px] overflow-clip top-[-100px] w-[167.193px]" data-name="classic">
      <div className="absolute h-[473.344px] left-[-12.46px] shadow-[0px_1.107px_1.107px_0px_rgba(0,0,0,0.25)] top-0 w-[184.078px]" data-name="smooth-gray-plaster-wall 1">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <img alt="" className="absolute h-full left-[-93.23%] max-w-none top-0 w-[257.14%]" src={img4} />
        </div>
      </div>
      <div className="absolute bg-[#00f500] h-[82.766px] left-[19.1px] top-[30.17px] w-[129.823px]" />
      <MaskGroup />
      <div className="absolute h-[87px] left-[16px] top-[29px] w-[137px]" data-name="image 1">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <img alt="" className="absolute h-[130.75%] left-0 max-w-none top-0 w-full" src={img5} />
        </div>
      </div>
      <MaskGroup1 />
      <div className="absolute h-[500.258px] left-[-1.38px] top-0 w-[172.984px]" data-name="classic overlay">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <img alt="" className="absolute h-[108.07%] left-[-24.52%] max-w-none top-[-3.42%] w-[124.52%]" src={img6} />
        </div>
      </div>
    </div>
  );
}

export default function PhotoTray() {
  return (
    <div className="bg-[#202020] relative size-full" data-name="Photo tray">
      <div className="absolute bottom-[72px] h-0 left-1/2 translate-x-[-50%] w-[240px]">
        <div className="absolute bottom-0 left-0 right-0 top-[-1px]">
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 240 1">
            <line id="Line 2" stroke="var(--stroke-0, #EC7777)" x2="240" y1="0.5" y2="0.5" />
          </svg>
        </div>
      </div>
      <Classic />
      <div className="absolute inset-0 pointer-events-none shadow-[0px_4px_6px_4px_inset_#ffffff]" />
    </div>
  );
}