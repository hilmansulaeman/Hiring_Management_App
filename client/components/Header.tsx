export default function Header() {
  return (
    <header className="w-full bg-white shadow-[0_4px_8px_0_rgba(0,0,0,0.10)] sticky top-0 z-50">
      <div className="flex items-center justify-end px-[120px] py-3 gap-[300px] bg-white backdrop-blur-[6px]">
        <div className="flex items-center gap-4">
          <div className="w-px h-6 bg-neutral-40"></div>
          <div className="flex items-end gap-[-12px]">
            <img
              src="https://api.builder.io/api/v1/image/assets/TEMP/e8a36fb1d9f45dae7cb3c58860fad5ef79c0d4c5?width=56"
              alt="User Avatar"
              className="w-7 h-7 rounded-full border border-neutral-40"
            />
          </div>
        </div>
      </div>
    </header>
  );
}
