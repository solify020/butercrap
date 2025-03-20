import FollowerTracker from "@/components/follower-tracker"

export default function FollowerTrackerPage() {
  return (
    <div className="min-h-screen bg-[#5a5a5a] text-white">
      <header className="flex justify-between items-center p-6 bg-[#333333] shadow-md">
        <h1 className="text-3xl font-bold tracking-tight">BUTERASCP OWNER</h1>
      </header>

      <main className="container mx-auto px-6 py-10">
        <FollowerTracker />
      </main>
    </div>
  )
}

