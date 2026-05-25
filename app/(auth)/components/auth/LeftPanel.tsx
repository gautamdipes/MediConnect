type Props = {
  title: string;
  subtitle: string;
};

export default function LeftPanel({
  title,
  subtitle,
}: Props) {
  return (
    <div className="flex h-full flex-col justify-center bg-gradient-to-b from-[#0057d9] to-[#003b96] px-14 text-white">
      <div className="mb-10 text-xs tracking-[3px] text-white/80">
        ENTERPRISE HEALTHCARE
      </div>

      <h1 className="mb-6 text-[58px] font-bold leading-[1.1]">
        {title}
      </h1>

      <p className="max-w-[430px] text-[20px] leading-[1.8] text-white/80">
        {subtitle}
      </p>
    </div>
  );
}