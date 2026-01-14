import { connectToDatabase } from "../mongo"
import { CodegenModel } from "./schema"
import { Codegen } from "./types"
import * as fs from "fs"
import * as path from "path"

const codegensPath = path.resolve(process.cwd(), "./data/codegens.json")

const currentCodegens: Codegen[] = JSON.parse(
    fs.readFileSync(codegensPath, "utf8"),
)

async function migrate() {
    await connectToDatabase()

    console.log("Starting codegen data migration...")

    try {
        const existingCodegens = await CodegenModel.find({})

        console.log(`${existingCodegens.length} existing codegens in database`)

        const existingCodegenMap = new Map(
            existingCodegens.map(codegen => [codegen.title, codegen]),
        )

        const currentCodegenMap = new Map(
            currentCodegens.map(codegen => [codegen.title, codegen]),
        )

        const updatePromises = currentCodegens.map(async codegen => {
            const exists = existingCodegenMap.has(codegen.title)

            if (exists) {
                const existingCodegen = existingCodegenMap.get(codegen.title)

                const existingData = { ...existingCodegen.toObject() }

                delete existingData._id
                delete existingData.__v
                delete existingData.createdAt
                delete existingData.updatedAt

                if (existingData.rules && Array.isArray(existingData.rules)) {
                    existingData.rules = existingData.rules.map(
                        (rule: Record<string, any>) => {
                          const cleanRule = { ...rule }
                          if (cleanRule._id) delete cleanRule._id
                          return cleanRule
                        },
                    )
                }

                const currentData = { ...codegen }

                const normalizedExisting = JSON.parse(JSON.stringify(existingData))
                const normalizedCurrent = JSON.parse(JSON.stringify(currentData))

                const isIdentical = deepEqual(normalizedExisting, normalizedCurrent)

                if (isIdentical) {
                    console.log(`⏭️ Skipped (no changes): ${codegen.title}`)
                } else {
                    console.log(`Differences found for ${codegen.title}`)

                    await CodegenModel.findOneAndUpdate(
                        { title: codegen.title },
                        codegen,
                        {
                          new: true,
                        },
                    )

                    console.log(`✅ Updated: ${codegen.title}`)
                }
            } else {
                await CodegenModel.create(codegen)
                console.log(`✅ Added: ${codegen.title}`)
            }
        })

        const deletePromises = existingCodegens
        .filter(codegen => !currentCodegenMap.has(codegen.title))
        .map(async codegen => {
            await CodegenModel.deleteOne({ title: codegen.title })
            console.log(`❌ Deleted: ${codegen.title}`)
        })

        await Promise.all([...updatePromises, ...deletePromises])

        const finalCodegens = await CodegenModel.find({})

        console.log(
            `Migration complete, ${finalCodegens.length} codegens in database`,
        )

        if (finalCodegens.length !== currentCodegens.length) {
            console.warn(
                `Warning: Number of codegens in database (${finalCodegens.length}) does not match source data (${currentCodegens.length})`,
            )
        } else {
            console.log("Database matches source data, migration successful!")
        }

    } catch (error) {
        console.error("Error during migration:", error)
        process.exit(1)
    }

    process.exit(0)
}

function deepEqual(obj1: any, obj2: any): boolean {
  if (obj1 === obj2) return true

  if (
    typeof obj1 !== "object" ||
    obj1 === null ||
    typeof obj2 !== "object" ||
    obj2 === null
  ) {
    return false
  }

  const keys1 = Object.keys(obj1)
  const keys2 = Object.keys(obj2)

  if (keys1.length !== keys2.length) return false

  for (const key of keys1) {
    if (!keys2.includes(key)) return false
    if (!deepEqual(obj1[key], obj2[key])) return false
  }

  return true
}


if (require.main === module) {
    migrate()
}