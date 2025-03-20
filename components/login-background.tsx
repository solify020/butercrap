export function LoginBackground() {
  return (
    <div className="fixed inset-0 overflow-hidden -z-10">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm z-10" />
      <div className="grid grid-cols-8 gap-4 absolute inset-0 transform rotate-[320deg] text-gray-800/5 select-none">
        {Array.from({ length: 200 }).map((_, i) => (
          <div key={i} className="text-3xl font-bold whitespace-nowrap">
            BUTERASCP BUTERASCP BUTERASCP BUTERASCP BUTERASCP
          </div>
        ))}
      </div>
    </div>
  )
}

