import path from "path"
import fs from "fs"

export type AIProvider =
  | "openai"
  | "anthropic"
  | "deepseek"
  | "ollama"
  | "openrouter"

export type AIModelConfig = {
  model: string
  title: string
  baseURL: string
  features: Array<"vision">
  apiKey: string
  extraBody?: Record<string, any>
}

export type AIProviderConfig = {
  provider: AIProvider
  models: AIModelConfig[]
}

export type ProcessedAIModelConfig = {
  model: string
  title: string
  baseURL: string
  apiKey: string
  headers?: Record<string, string>
  extraBody?: Record<string, any>
}

export type ProcessedAIProviderConfig = {
  provider: AIProvider
  models: ProcessedAIModelConfig[]
}

export type AIProvidersConfig = {
  providers: AIProviderConfig[]
}

let configCache: Record<AIProvider, ProcessedAIProviderConfig> | null = null

export function getConfigFilePath(): string {
  // Use default path
  const configFileName = "data/config.json"
  const configFilePath = path.join(process.cwd(), configFileName)

  return configFilePath
}

export function loadAIProvidersConfig(
  forceReload = false,
): Record<AIProvider, ProcessedAIProviderConfig> {
  if (configCache && !forceReload) {
    return configCache
  }

  try {
    const configFilePath = getConfigFilePath()
    console.log(`Loading AI providers config from: ${configFilePath}`)

    const configFileContent = fs.readFileSync(configFilePath, "utf-8")
    const config = JSON.parse(configFileContent) as AIProvidersConfig

    const processedConfig = config.providers.reduce(
      (acc, providerConfig) => {
        const provider = providerConfig.provider

        const processedModels = providerConfig.models.map(model => {
          return {
            ...model,
          }
        })

        acc[provider] = {
          provider,
          models: processedModels,
        }

        return acc
      },
      {} as Record<AIProvider, ProcessedAIProviderConfig>,
    )

    configCache = processedConfig

    return processedConfig

  } catch (error) {
    console.error("Error loading AI providers configuration:", error)
    throw new Error(`Failed to load AI providers configuration: ${error}`)
  }
}

export function getAIProviders(): Record<
  AIProvider,
  ProcessedAIProviderConfig
> {
  return loadAIProvidersConfig()
}

export function findModelConfig(
  provider: AIProvider,
  modelName: string,
): ProcessedAIModelConfig {
  const providerConfig = getAIProviders()[provider]

  const modelConfig = providerConfig.models.find(
    model => model.model === modelName,
  )

  if (!modelConfig) {
    throw new Error(`Model "${modelName}" not found for provider "${provider}"`)
  }

  return modelConfig
}