import CheckPrismaReferences from "@/scripts/check-prisma-references"

export default function DiagnosticsPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <CheckPrismaReferences />
    </div>
  )
}

