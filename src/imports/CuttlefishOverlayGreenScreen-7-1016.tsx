import imgCuttleOverlay from "figma:asset/7168be5732ebbf43ae8c6eaf553b1d3e6ad260ec.png";

export default function CuttlefishOverlayGreenScreen() {
  return (
    <div className="bg-white relative size-full" data-name="cuttlefish overlay green screen">
      <div className="absolute bg-[#00f500] h-[418px] left-[32px] top-[58px] w-[538px]" />
      <div className="absolute bg-[#00f500] h-[418px] left-[33px] top-[507px] w-[538px]" />
      <div className="absolute bg-[#00f500] h-[418px] left-[32px] top-[956px] w-[538px]" />
      <div className="absolute h-[1710px] left-0 top-px w-[604px]" data-name="cuttle overlay">
        <img alt="" className="absolute inset-0 max-w-none object-50%-50% object-cover pointer-events-none size-full" src={imgCuttleOverlay} />
      </div>
    </div>
  );
}