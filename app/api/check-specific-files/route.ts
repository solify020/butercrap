import { NextResponse } from "next/server"
import fs from "fs"
import path from "path"
import { promisify } from "util"

const readFile = promisify(fs.readFile)
const exists = promisify(fs.exists)

// List of specific files to check
const filesToCheck = [
  "prisma/schema.prisma",
  "schema.prisma",
  "prisma.schema",
  "prisma.config.js",
  "prisma.config.ts",
  ".env",
  ".env.local",
  ".env.development",
  ".env.production",
  "package.json",
  "package-lock.json",
  "yarn.lock",
  "next.config.js",
  "next.config.mjs",
  "next.config.ts",
  "vercel.json",
]

export async function GET() {
  const projectRoot = process.cwd()
  const results: Record<string, any> = {}

  for (const file of filesToCheck) {
    const filePath = path.join(projectRoot, file)
    const fileExists = await exists(filePath).catch(() => false)

    if (fileExists) {
      try {
        // For sensitive files, just note they exist but don't read content
        if (file.includes(".env") || file === "package-lock.json" || file === "yarn.lock") {
          results[file] = { exists: true, content: "[REDACTED]" }
        } else {
          // Read content for analysis
          const content = await readFile(filePath, "utf8")

          // For package.json, parse and extract relevant parts
          if (file === "package.json") {
            try {
              const packageJson = JSON.parse(content)
              results[file] = {
                exists: true,
                name: packageJson.name,
                dependencies: packageJson.dependencies || {},
                devDependencies: packageJson.devDependencies || {},
              }
            } catch (error) {
              results[file] = { exists: true, error: "Failed to parse JSON" }
            }
          }
          // For config files, check for Prisma references
          else if (file.includes("next.config") || file === "vercel.json") {
            results[file] = {
              exists: true,
              hasPrismaReferences:
                content.includes("prisma") || content.includes("Prisma") || content.includes("DATABASE_URL"),
            }
          }
          // For Prisma files, include the content for analysis
          else if (file.includes("prisma") || file.includes("schema")) {
            results[file] = { exists: true, content }
          }
        }
      } catch (error) {
        results[file] = { exists: true, error: "Failed to read file" }
      }
    } else {
      results[file] = { exists: false }
    }
  }

  return NextResponse.json(results)
}

