import { WorkflowContext } from "../../type"
import {
    getFileStructureRule,
    getStylesRule,
    getPublicComponentsRule,
    getSpecialAttentionRules,
  } from "../../utils/codegenRules"
import { ModelMessage } from "ai"

const generateOutputSpecification = (
    rules: WorkflowContext["query"]["rules"],
  ): string => {
    const fileStructure = getFileStructureRule(rules)
    if (!fileStructure) return ""

    return `
      ## Output Specification
      ${fileStructure}
    `
  }

const generateStyleSpecification = (
  rules: WorkflowContext["query"]["rules"],
): string => {
  const styles = getStylesRule(rules)
  if (!styles) return ""
  
  return `
    ## Style Specification
    ${styles}
  `
}

const generateOpenSourceComponents = (
  rules: WorkflowContext["query"]["rules"],
): string => {
  const publicComponents = getPublicComponentsRule(rules)
  if (!publicComponents || publicComponents.length === 0) return ""

  return `
    **Open Source Components**
    - You can use components from ${publicComponents.join(", ")}
    - Use the latest stable version of APIs
  `
}

const generatePrivateComponents = (
  retrievedAugmentationContent?: string,
): string => {
  if (!retrievedAugmentationContent) return ""
  
  return `
    **Private Components**
    - Must strictly follow the API defined in the documentation below
    - Using undocumented private component APIs is prohibited
    <basic-component-docs>
      ${retrievedAugmentationContent}
    </basic-component-docs>
  `
}

const generateAdditionalRules = (
  rules: WorkflowContext["query"]["rules"],
): string => {
  const specialAttentionRules = getSpecialAttentionRules(rules)
  if (!specialAttentionRules) return ""

  return `
    ## Additional Rules
    ${specialAttentionRules}
  `
}

export const buildSystemPrompt = (
    rules: WorkflowContext["query"]["rules"],
    retrievedAugmentationContent?: string,
  ): string => {
    const outputSpecification = generateOutputSpecification(rules)
    const styleSpecification = generateStyleSpecification(rules)
    const openSourceComponents = generateOpenSourceComponents(rules)
    const privateComponents = generatePrivateComponents(
      retrievedAugmentationContent,
    )
    const additionalRules = generateAdditionalRules(rules)

    const hasComponentGuidelines = openSourceComponents || privateComponents

    const componentGuidelinesHeader = hasComponentGuidelines
      ? "## Component Usage Guidelines\n"
      : ""

    const componentGuidelines = hasComponentGuidelines
      ? `${componentGuidelinesHeader}${openSourceComponents}${privateComponents}`
      : ""

    return `
      # You are a senior frontend engineer focused on business component development
  
      ## Goal
      Generate business component code based on user requirements
      ${outputSpecification}
      ${styleSpecification}
      ${componentGuidelines}
      ${additionalRules}
    `
  }

export const buildCurrentComponentMessage = (
  component: WorkflowContext["query"]["component"],
): Array<ModelMessage> => {
  return component && !component.isInitialized
    ? [
        {
          role: "user",
          content:
            component?.prompt?.map(prompt => {
              if (prompt.type === "image") {
                return { type: "image" as const, image: prompt.image }
              }
              return { type: "text" as const, text: prompt.text }
            }) || [],
        },
        {
          role: "assistant",
          content: `
          - Component name: ${component?.name}
          - Component code:
          ${component?.code}
        `,
        },
      ]
    : []
}

export const buildUserMessage = (
  prompt: WorkflowContext["query"]["prompt"],
  design: NonNullable<WorkflowContext["state"]>["designTask"],
): Array<ModelMessage> => {
  return [
    {
      role: "user",
      content: prompt.map(p => {
        if (p.type === "image") {
          return { type: "image" as const, image: p.image }
        }
        return {
          type: "text" as const,
          text: `<user-requirements>
        ${p.text}

        ## Component Design Information
        - Component Name: ${design?.componentName}
        - Component Description: ${design?.componentDescription}
        - Base Components Used:
        ${design?.library
          ?.map(
            lib => `
          ${lib.name}:
          - Component List: ${lib.components.join(", ")}
          - Usage Instructions: ${lib.description}
        `,
          )
          .join("\n")}
        </user-requirements>`,
        }
      })
    }
  ]
}

export const generateComponentMessage = (
  context: WorkflowContext,
): Array<ModelMessage> => {
  if (!context.state?.designTask) {
    throw new Error("Design task is required but not found in context")
  }

  return [
    ...buildCurrentComponentMessage(context.query.component),
    ...buildUserMessage(context.query.prompt, context.state.designTask),
  ]
}