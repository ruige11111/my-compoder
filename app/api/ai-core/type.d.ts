import { Prompt } from "@/lib/db/componentCode/types"
import { LanguageModel } from "ai"
import { CodegenRule } from "@/lib/db/codegen/types"

type WorkflowQuery = {
  prompt: Prompt[]
  aiModel: LanguageModel
  rules: CodegenRule[]
  userId: string
  codegenId?: string
  component?: {
    id: string
    name: string
    code: string
    prompt: Prompt[]
    isInitialized?: boolean
  }
}

export type InitialWorkflowContext = {
    stream: {
      write: (chunk: string) => void
      close: () => void
    }
    query: WorkflowQuery
    state?: never
}

export type DesignProcessingWorkflowContext = {
  stream: {
    write: (chunk: string) => void
    close: () => void
  }
  query: WorkflowQuery
  state: {
    designTask: {
      componentName: string
      componentDescription: string
      library: Array<{
        name: string
        components: string[]
        description: string
      }>
      retrievedAugmentationContent?: string
    }
  }
}

export type GenerateProcessingWorkflowContext = {
  stream: {
    write: (chunk: string) => void
    close: () => void
  }
  query: WorkflowQuery
  state: {
    designTask: {
      componentName: string
      componentDescription: string
      library: Array<{
        name: string
        components: string[]
        description: string
      }>
      retrievedAugmentationContent?: string
    }
    generatedCode: string
  }
}

export type WorkflowContext =
  | InitialWorkflowContext
  | DesignProcessingWorkflowContext
  | GenerateProcessingWorkflowContext