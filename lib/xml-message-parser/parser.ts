import { Artifact } from "./artifact-stream-parser"
import { FileNode } from "@/components/biz/CodeIDE/interface"

export function transformComponentArtifactFromXml(xmlString: string): Artifact {
  try {
    const nameMatch = xmlString.match(/<ComponentArtifact\s+name="([^"]+)">/)
    const componentName = nameMatch ? nameMatch[1] : null

    const componentFiles = []

    const fileRegex =
      /<ComponentFile\s+fileName="([^"]+)"(?:\s+isEntryFile="([^"]+)")?\s*>([\s\S]*?)<\/ComponentFile>/g

    let match

    while ((match = fileRegex.exec(xmlString)) !== null) {
        componentFiles.push({
          fileName: match[1],
          isEntryFile: match[2] === "true",
          content: match[3],
        })
    }

    const fileNodes: FileNode[] = componentFiles.map(file => ({
        id: file.fileName,
        name: file.fileName,
        content: file.content,
        isEntryFile: file.isEntryFile,
    }))

    return {
        componentName,
        entryFile: componentFiles.find(file => file.isEntryFile)?.fileName,
        files: fileNodes,
        codes: getCodesFromFileNodes(fileNodes),
    }

    
  } catch (error) {
    console.error("Error processing Component Artifact XML:", error)
    throw error
  }
}

export type Codes = Record<string, string>

export function getCodesFromFileNodes(fileNodes: FileNode[]) {
    return fileNodes.reduce((acc, file) => {
      if (file.content) {
        acc[file.name] = file.content
      }
      return acc
    }, {} as Codes)
}

export function transformTryCatchErrorFromXml(xmlString: string) {
  const errorMessage = xmlString.match(
    /<TryCatchError>([\s\S]*?)<\/TryCatchError>/,
  )
  return errorMessage ? errorMessage[1] : null
}

export function transformFileNodeToXml(
  fileNodes: FileNode[],
  componentName: string,
) {
  const xmlFileString = fileNodes
    .map(
      file =>
        `<ComponentFile fileName="${file.name}" isEntryFile="${file.isEntryFile}">${file.content}</ComponentFile>`,
    )
    .join("\n")

  return `<ComponentArtifact name="${componentName}">${xmlFileString}</ComponentArtifact>`
}

export interface ComponentDesign {
  componentName: string
  componentDescription: string
  library: Array<{
    name: string
    components: string[]
    description: string
  }>
  retrievedAugmentationContent?: string
}

export function transformComponentDesignFromXml(
  xmlString: string,
): ComponentDesign {
  try {
    const nameMatch = xmlString.match(
      /<ComponentName>([\s\S]*?)<\/ComponentName>/,
    )
    const componentName = nameMatch ? nameMatch[1].trim() : "componentName"

    const descMatch = xmlString.match(
      /<ComponentDescription>([\s\S]*?)<\/ComponentDescription>/,
    )
    const componentDescription = descMatch
      ? descMatch[1].trim()
      : "componentDescription"

    const libraries = []
    const libraryRegex = /<Library>([\s\S]*?)<\/Library>/g
    let libraryMatch

    while ((libraryMatch = libraryRegex.exec(xmlString)) !== null) {
      const libraryContent = libraryMatch[1]

      let libNameMatch = libraryContent.match(/<Name>([\s\S]*?)<\/Name>/)
      if (!libNameMatch) {
        // Try alternative tag <n>
        libNameMatch = libraryContent.match(/<n>([\s\S]*?)<\/n>/)
      }
      const name = libNameMatch ? libNameMatch[1].trim() : ""

      const components = []
      const componentRegex = /<Component>([\s\S]*?)<\/Component>/g
      let componentMatch

      while ((componentMatch = componentRegex.exec(libraryContent)) !== null) {
        components.push(componentMatch[1].trim())
      }

      const libDescMatch = libraryContent.match(
        /<Description>([\s\S]*?)<\/Description>/,
      )
      const description = libDescMatch ? libDescMatch[1].trim() : ""

      libraries.push({ name, components, description })
    }

    return {
      componentName,
      componentDescription,
      library: libraries,
    }
  } catch (error) {
    console.error("Error processing Component Design XML:", error)
    throw new Error(`Failed to parse Component Design XML: ${error}`)
  }
}