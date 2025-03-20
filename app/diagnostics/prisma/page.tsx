import { PrismaDetector } from "@/components/prisma-detector"

export default function PrismaDiagnosticsPage() {
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Prisma Deployment Issue Diagnostics</h1>

        <div className="bg-white p-6 rounded-lg shadow-md mb-6">
          <h2 className="text-xl font-semibold mb-4">Common Causes of Prisma Deployment Issues</h2>

          <div className="space-y-4">
            <div>
              <h3 className="font-medium">1. Prisma Schema Files</h3>
              <p className="text-sm text-gray-600 mt-1">
                Check if your project contains a{" "}
                <code className="bg-gray-100 px-1 py-0.5 rounded">prisma/schema.prisma</code> file. Even if you're not
                using Prisma directly, some frameworks or templates might include this file.
              </p>
            </div>

            <div>
              <h3 className="font-medium">2. Package Dependencies</h3>
              <p className="text-sm text-gray-600 mt-1">
                Check your <code className="bg-gray-100 px-1 py-0.5 rounded">package.json</code> for dependencies like
                <code className="bg-gray-100 px-1 py-0.5 rounded">@prisma/client</code> or
                <code className="bg-gray-100 px-1 py-0.5 rounded">prisma</code>. Also check for frameworks that might
                include Prisma as a dependency.
              </p>
            </div>

            <div>
              <h3 className="font-medium">3. Environment Variables</h3>
              <p className="text-sm text-gray-600 mt-1">
                Check your <code className="bg-gray-100 px-1 py-0.5 rounded">.env</code> files for variables like
                <code className="bg-gray-100 px-1 py-0.5 rounded">DATABASE_URL</code> which might trigger Prisma
                detection.
              </p>
            </div>

            <div>
              <h3 className="font-medium">4. Database Migrations</h3>
              <p className="text-sm text-gray-600 mt-1">
                Check for a <code className="bg-gray-100 px-1 py-0.5 rounded">prisma/migrations</code> directory which
                might contain database migration files.
              </p>
            </div>

            <div>
              <h3 className="font-medium">5. Third-Party Libraries</h3>
              <p className="text-sm text-gray-600 mt-1">
                Some libraries might use Prisma internally. Common examples include certain auth libraries, CMS systems,
                or database utilities.
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md mb-6">
          <h2 className="text-xl font-semibold mb-4">Project Structure Analysis</h2>

          <p className="mb-4">
            Visit the{" "}
            <a href="/project-scan" className="text-blue-600 hover:underline">
              Project Scanner
            </a>{" "}
            page to run a server-side scan of your project files for Prisma references.
          </p>

          <PrismaDetector />
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Solutions</h2>

          <div className="space-y-4">
            <div>
              <h3 className="font-medium">1. Remove Prisma Files</h3>
              <p className="text-sm text-gray-600 mt-1">
                If you find any Prisma schema or migration files, remove them from your project.
              </p>
            </div>

            <div>
              <h3 className="font-medium">2. Update Dependencies</h3>
              <p className="text-sm text-gray-600 mt-1">
                Remove Prisma-related dependencies from your package.json and run npm install or yarn to update your
                lock file.
              </p>
            </div>

            <div>
              <h3 className="font-medium">3. Clean Environment Variables</h3>
              <p className="text-sm text-gray-600 mt-1">
                Remove or rename any database connection strings that might trigger Prisma detection.
              </p>
            </div>

            <div>
              <h3 className="font-medium">4. Alternative Deployment</h3>
              <p className="text-sm text-gray-600 mt-1">
                If you need to use Prisma, consider deploying your project directly through Vercel's dashboard rather
                than through v0.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

