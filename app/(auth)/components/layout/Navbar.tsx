import Link from "next/link";

export default function Navbar() {
  return (
    <header className="w-full border-b border-gray-200 bg-[#f7f7f7]">
      <div className="mx-auto flex h-[72px] max-w-[1400px] items-center justify-between px-8">
        <h1 className="text-[32px] font-bold">
          MediConnect
        </h1>

        <nav className="hidden gap-14 text-[15px] text-gray-600 md:flex">
          <Link href="#">Hospitals</Link>
          <Link href="#">Doctors</Link>
          <Link href="#">About Us</Link>
        </nav>

        <div className="flex items-center gap-6">
          <Link
            href="/login"
            className="text-[15px] text-gray-700"
          >
            Log In
          </Link>

          <Link
            href="/signup"
            className="rounded-md bg-[#0057d9] px-5 py-2.5 text-sm font-semibold text-white"
          >
            SignUp
          </Link>
        </div>
      </div>
    </header>
  );
}