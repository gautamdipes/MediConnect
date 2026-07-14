import Image from "next/image";

type BrandLogoProps = {
  size?: number;
  className?: string;
  showText?: boolean;
  subtitle?: string;
  textClassName?: string;
  subtitleClassName?: string;
};

export function BrandLogo({
  size = 40,
  className = "",
  showText = false,
  subtitle,
  textClassName = "text-[20px] font-black tracking-tight text-[#0057d9] leading-none",
  subtitleClassName = "text-[11px] font-bold text-gray-400 tracking-wide mt-1",
}: BrandLogoProps) {
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <div
        className="relative shrink-0 overflow-hidden rounded-[22%] shadow-sm"
        style={{ width: size, height: size }}
      >
        <Image
          src="/logo.png"
          alt="MediConnect"
          fill
          sizes={`${size}px`}
          className="object-contain"
          priority
        />
      </div>
      {showText && (
        <div>
          <h2 className={textClassName}>Mediconnect</h2>
          {subtitle ? <p className={subtitleClassName}>{subtitle}</p> : null}
        </div>
      )}
    </div>
  );
}
