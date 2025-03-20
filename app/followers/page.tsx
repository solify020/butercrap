// app/followers/page.tsx

// Import the ZoomIn component
import { ZoomIn } from "@/components/animations/zoom-in"

export default function FollowersPage() {
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-4">Followers</h1>

      {/* Stats Cards Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        <ZoomIn delay={100}>
          <div className="bg-white shadow-md rounded-lg p-4">
            <h2 className="text-lg font-semibold">Total Followers</h2>
            <p className="text-3xl">1,500</p>
          </div>
        </ZoomIn>
        <ZoomIn delay={150}>
          <div className="bg-white shadow-md rounded-lg p-4">
            <h2 className="text-lg font-semibold">New Followers (Last 7 Days)</h2>
            <p className="text-3xl">150</p>
          </div>
        </ZoomIn>
        <ZoomIn delay={200}>
          <div className="bg-white shadow-md rounded-lg p-4">
            <h2 className="text-lg font-semibold">Unfollowers (Last 7 Days)</h2>
            <p className="text-3xl">20</p>
          </div>
        </ZoomIn>
      </div>

      {/* Follower Chart/Graph Section */}
      <ZoomIn delay={250} duration={450}>
        <div className="bg-white shadow-md rounded-lg p-4">
          <h2 className="text-lg font-semibold">Follower Growth</h2>
          {/* Placeholder for the chart/graph component */}
          <p>Chart/Graph Component Here</p>
        </div>
      </ZoomIn>
    </div>
  )
}

