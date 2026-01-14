import { GenerateProcessingWorkflowContext } from "../../type"
import {
    initComponentCode,
    updateComponentCodeVersion,
  } from "@/lib/db/componentCode/mutations"
import { transformComponentArtifactFromXml } from "@/lib/xml-message-parser/parser"

export const initComponent = async (
    context: GenerateProcessingWorkflowContext,
  ): Promise<GenerateProcessingWorkflowContext> => {
    if (!context.query.component) {
        throw new Error("Component not found")
    }

    const originalCode = context.query.component.code

    if (originalCode) {
        throw new Error("Component already initialized")
    }

    await initComponentCode({
        id: context.query.component.id,
        code: context.state.generatedCode,
        name: context.state.designTask.componentName,
        description: context.state.designTask.componentDescription,
    })

    context.stream.close()

    return context
  }

function mergeComponentFiles(originalXml: string, newXml: string): string {
  const originalComponent = transformComponentArtifactFromXml(originalXml)
  const newComponent = transformComponentArtifactFromXml(newXml)

  if (!originalComponent || !newComponent) {
    // 如果无法解析，直接返回原始的XML
    return originalXml
  }

  const fileMap = new Map()

  originalComponent.files.forEach(file => {
    fileMap.set(file.name, {
      content: file.content,
      isEntryFile: file.isEntryFile,
    })
  })

  newComponent.files.forEach(file => {
    fileMap.set(file.name, {
      content: file.content,
      isEntryFile: file.isEntryFile,
    })
  })

  let mergedXml = `<ComponentArtifact name="${
    newComponent.componentName || originalComponent.componentName
  }">`

  fileMap.forEach((file, fileName) => {
    mergedXml += `\n  <ComponentFile fileName="${fileName}" isEntryFile="${file.isEntryFile}">`
    mergedXml += file.content
    mergedXml += `</ComponentFile>`
  })

  mergedXml += "\n</ComponentArtifact>"

  return mergedXml
}


export const updateComponent = async (
  context: GenerateProcessingWorkflowContext,
): Promise<GenerateProcessingWorkflowContext> => {
  if (!context.query.component) {
    throw new Error("Component not found")
  }

  const originalCode = context.query.component.code
  const newCode = context.state.generatedCode

  const mergedCode = mergeComponentFiles(originalCode, newCode)

  await updateComponentCodeVersion({
    id: context.query.component.id,
    prompt: context.query.prompt,
    code: mergedCode,
  })

  context.stream.close()

  return context
}