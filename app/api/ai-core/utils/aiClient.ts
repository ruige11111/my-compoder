import { type AIProvider, findModelConfig } from "@/lib/config/ai-providers"
import { createAnthropic } from "@ai-sdk/anthropic"

export const getAIClient = (provider: AIProvider, model: string) => {
    const modelConfig = findModelConfig(provider, model)

    switch (provider) {
        case "anthropic":
            return createAnthropic({
                baseURL: modelConfig.baseURL,
                apiKey: modelConfig.apiKey,
            })(modelConfig.model)
        default:
            throw new Error(`Unsupported AI provider: ${provider}`)
    }
}