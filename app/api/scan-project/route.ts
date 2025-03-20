import { NextResponse } from "next/server"
import fs from "fs"
import path from "path"
import { promisify } from "util"

const readdir = promisify(fs.readdir)
const readFile = promisify(fs.readFile)
const stat = promisify(fs.stat)

// Function to recursively scan directories
async function scanDirectory(dir: string, results: any[] = [], depth = 0) {
  // Limit depth to prevent infinite recursion
  if (depth > 10) return results

  try {
    const files = await readdir(dir)

    for (const file of files) {
      const filePath = path.join(dir, file)
      const stats = await stat(filePath)

      // Skip node_modules and .next directories
      if (file === "node_modules" || file === ".next") continue

      if (stats.isDirectory()) {
        // Recursively scan subdirectories
        await scanDirectory(filePath, results, depth + 1)
      } else {
        // Check if file might contain Prisma references
        if (
          file.endsWith(".js") ||
          file.endsWith(".ts") ||
          file.endsWith(".jsx") ||
          file.endsWith(".tsx") ||
          file === "package.json" ||
          file === ".env" ||
          file === ".env.local" ||
          file.includes("prisma")
        ) {
          try {
            const content = await readFile(filePath, "utf8")

            // Check for Prisma-related content
            if (
              content.includes("prisma") ||
              content.includes("Prisma") ||
              content.includes("@prisma/client") ||
              content.includes("DATABASE_URL") ||
              (file === "package.json" && (content.includes('"prisma"') || content.includes('"@prisma/client"')))
            ) {
              results.push({
                file: filePath,
                reason: "Contains Prisma-related content",
              })
            }
          } catch (error) {
            console.error(`Error reading file ${filePath}:`, error)
          }
        }

        // Check for Prisma-related filenames
        if (
          file === "schema.prisma" ||
          file === "prisma.schema" ||
          file === "prisma.config.js" ||
          file === "prisma.config.ts" ||
          file.includes("prisma")
        ) {
          results.push({
            file: filePath,
            reason: "Filename suggests Prisma usage",
          })
        }
      }
    }
  } catch (error) {
    console.error(`Error scanning directory ${dir}:`, error)
  }

  return results
}

export async function GET() {
  try {
    // Start scanning from project root
    const projectRoot = process.cwd()
    const findings = await scanDirectory(projectRoot)

    // Also check for environment variables that might suggest Prisma
    const prismaRelatedEnvVars = Object.keys(process.env)
      .filter(
        (key) =>
          key.includes("DATABASE_URL") ||
          key.includes("PRISMA") ||
          key.includes("DB_URL") ||
          key.includes("POSTGRES") ||
          key.includes("MYSQL"),
      )
      .map((key) => ({ name: key, value: "[REDACTED]" }))

    // Check for package.json in the root
    let packageJson = null
    try {
      const packageJsonPath = path.join(projectRoot, "package.json")
      if (fs.existsSync(packageJsonPath)) {
        const content = await readFile(packageJsonPath, "utf8")
        packageJson = JSON.parse(content)
      }
    } catch (error) {
      console.error("Error reading package.json:", error)
    }

    // Extract dependencies that might be related to Prisma
    const prismaRelatedDependencies = packageJson
      ? Object.keys({
          ...(packageJson.dependencies || {}),
          ...(packageJson.devDependencies || {}),
        }).filter(
          (dep) =>
            dep.includes("prisma") ||
            dep.includes("database") ||
            dep === "pg" ||
            dep === "mysql" ||
            dep === "mysql2" ||
            dep === "sequelize" ||
            dep === "typeorm",
        )
      : []

    return NextResponse.json({
      findings,
      prismaRelatedEnvVars,
      prismaRelatedDependencies,
      packageJson: packageJson
        ? {
            name: packageJson.name,
            dependencies: Object.keys(packageJson.dependencies || {}),
            devDependencies: Object.keys(packageJson.devDependencies || {}),
          }
        : null,
    })
  } catch (error) {
    console.error("Error scanning project:", error)
    return NextResponse.json({ error: "Failed to scan project" }, { status: 500 })
  }
}

