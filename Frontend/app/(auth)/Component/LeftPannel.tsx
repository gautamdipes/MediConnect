type Props = {
  title: string;
  subtitle: string;
};

export default function LeftPanel({
  title,
  subtitle,
}: Props) {
  return (
    <div className="flex h-full w-full flex-col justify-center bg-gradient-to-b from-[#0057d9] to-[#003b96] px-14 text-white">
      <div className="mb-10 flex items-center gap-2 text-xs tracking-[3px] text-white/80">
        <div className="h-4 w-4 rounded-full border border-white"></div>
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