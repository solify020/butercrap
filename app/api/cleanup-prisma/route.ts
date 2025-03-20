import { NextResponse } from "next/server"
import fs from "fs"
import path from "path"
import { promisify } from "util"

const readdir = promisify(fs.readdir)
const stat = promisify(fs.stat)
const unlink = promisify(fs.unlink)
const rmdir = promisify(fs.rmdir)
const exists = promisify(fs.exists)

// Function to recursively find and remove Prisma-related files
async function findAndRemovePrismaFiles(dir: string, removedFiles: string[] = [], depth = 0) {
  // Limit depth to prevent infinite recursion
  if (depth > 10) return removedFiles

  try {
    // Check if directory exists
    const dirExists = await exists(dir).catch(() => false)
    if (!dirExists) return removedFiles

    const files = await readdir(dir)

    for (const file of files) {
      const filePath = path.join(dir, file)
      const stats = await stat(filePath)

      // Skip node_modules and .next directories
      if (file === "node_modules" || file === ".next") continue

      if (stats.isDirectory()) {
        // Special case for prisma directory
        if (file === "prisma") {
          try {
            // Remove all files in the prisma directory
            const prismaFiles = await readdir(filePath)
            for (const prismaFile of prismaFiles) {
              const prismaFilePath = path.join(filePath, prismaFile)
              const prismaStats = await stat(prismaFilePath)

              if (prismaStats.isDirectory()) {
                // For directories like migrations
                await findAndRemovePrismaFiles(prismaFilePath, removedFiles, depth + 1)
                try {
                  await rmdir(prismaFilePath)
                  removedFiles.push(prismaFilePath)
                } catch (error) {
                  console.error(`Error removing directory ${prismaFilePath}:`, error)
                }
              } else {
                // For files like schema.prisma
                try {
                  await unlink(prismaFilePath)
                  removedFiles.push(prismaFilePath)
                } catch (error) {
                  console.error(`Error removing file ${prismaFilePath}:`, error)
                }
              }
            }

            // Try to remove the prisma directory itself
            try {
              await rmdir(filePath)
              removedFiles.push(filePath)
            } catch (error) {
              console.error(`Error removing directory ${filePath}:`, error)
            }
          } catch (error) {
            console.error(`Error processing prisma directory ${filePath}:`, error)
          }
        } else {
          // Recursively scan other directories
          await findAndRemovePrismaFiles(filePath, removedFiles, depth + 1)
        }
      } else {
        // Check if file is Prisma-related
        if (
          file === "schema.prisma" ||
          file === "prisma.schema" ||
          file === "prisma.config.js" ||
          file === "prisma.config.ts" ||
          (file.includes("prisma") && (file.endsWith(".prisma") || file.endsWith(".sql")))
        ) {
          try {
            await unlink(filePath)
            removedFiles.push(filePath)
          } catch (error) {
            console.error(`Error removing file ${filePath}:`, error)
          }
        }
      }
    }
  } catch (error) {
    console.error(`Error scanning directory ${dir}:`, error)
  }

  return removedFiles
}

export async function POST() {
  try {
    const projectRoot = process.cwd()
    const removedFiles = await findAndRemovePrismaFiles(projectRoot)

    return NextResponse.json({
      success: true,
      removedCount: removedFiles.length,
      removedFiles,
    })
  } catch (error) {
    console.error("Error cleaning up Prisma files:", error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}

