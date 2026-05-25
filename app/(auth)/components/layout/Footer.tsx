export default function Footer() {
  return (
    <footer className="mt-10 border-t border-gray-200 bg-[#efefef]">
      <div className="mx-auto flex max-w-[1400px] items-center justify-between px-8 py-6">
        <div className="text-[24px] font-bold">
          MediConnect
        </div>

        <div className="flex gap-6 text-sm text-gray-500">
          <p>Privacy Policy</p>
          <p>Terms of Service</p>
          <p>HIPAA Compliance</p>
        </div>

        <div className="text-sm text-gray-500">
          © 2024 MediConnect
        </div>
      </div>
    </footer>
  );
}