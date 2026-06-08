import { ReactNode } from "react";

type Props = {
  left: ReactNode;
  right: ReactNode;
};

export default function AuthLayout({
  left,
  right,
}: Props) {
  return (
    <div className="min-h-screen bg-[#f5f5f5]">
      <main className="mx-auto flex max-w-[1500px] items-center justify-center px-8 py-14">
        <div className="grid h-[850px] w-full max-w-[1200px] grid-cols-2 overflow-hidden rounded-2xl bg-white shadow-sm">
          {left}
          {right}
        </div>
      </main>
    </div>
  );
}
