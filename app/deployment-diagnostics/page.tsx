import Link from "next/link"

export default function DeploymentDiagnosticsPage() {
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Deployment Diagnostics Dashboard</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Link href="/diagnostics/prisma" className="block">
            <div className="bg-white p-6 rounded-lg shadow-md h-full hover:shadow-lg transition-shadow">
              <h2 className="text-xl font-semibold mb-2">Prisma Diagnostics</h2>
              <p className="text-gray-600">
                Comprehensive guide to identifying and resolving Prisma-related deployment issues.
              </p>
            </div>
          </Link>

          <Link href="/project-scan" className="block">
            <div className="bg-white p-6 rounded-lg shadow-md h-full hover:shadow-lg transition-shadow">
              <h2 className="text-xl font-semibold mb-2">Project Scanner</h2>
              <p className="text-gray-600">
                Scan your entire project for any files or code that might reference Prisma.
              </p>
            </div>
          </Link>

          <Link href="/file-check" className="block">
            <div className="bg-white p-6 rounded-lg shadow-md h-full hover:shadow-lg transition-shadow">
              <h2 className="text-xl font-semibold mb-2">Specific File Check</h2>
              <p className="text-gray-600">Check specific files that commonly cause Prisma detection issues.</p>
            </div>
          </Link>

          <Link href="/diagnostics" className="block">
            <div className="bg-white p-6 rounded-lg shadow-md h-full hover:shadow-lg transition-shadow">
              <h2 className="text-xl font-semibold mb-2">Client-Side Diagnostics</h2>
              <p className="text-gray-600">Run client-side checks for Prisma references in your application.</p>
            </div>
          </Link>

          <Link href="/cleanup" className="block">
            <div className="bg-white p-6 rounded-lg shadow-md h-full hover:shadow-lg transition-shadow">
              <h2 className="text-xl font-semibold mb-2">Prisma Cleanup</h2>
              <p className="text-gray-600">Automatically remove all Prisma-related files from your project.</p>
            </div>
          </Link>
        </div>

        <div className="mt-8 bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Common Deployment Issues</h2>

          <div className="space-y-4">
            <div>
              <h3 className="font-medium">1. Prisma Detection</h3>
              <p className="text-sm text-gray-600 mt-1">
                v0 currently doesn't support deploying Prisma. This can be triggered by Prisma schema files,
                dependencies, or environment variables.
              </p>
            </div>

            <div>
              <h3 className="font-medium">2. Environment Variables</h3>
              <p className="text-sm text-gray-600 mt-1">
                Make sure all required environment variables are properly set in your Vercel project.
              </p>
            </div>

            <div>
              <h3 className="font-medium">3. Build Errors</h3>
              <p className="text-sm text-gray-600 mt-1">
                Check your build logs for any errors that might be preventing deployment.
              </p>
            </div>

            <div>
              <h3 className="font-medium">4. API Routes</h3>
              <p className="text-sm text-gray-600 mt-1">
                Ensure your API routes are properly configured and don't have any runtime errors.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

