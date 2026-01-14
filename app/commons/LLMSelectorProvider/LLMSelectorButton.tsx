import { useLLMOptions } from "@/app/commons/LLMSelectorProvider/useLLMOptions"
import { useLLMSelectorContext } from "./LLMSelectorContext"
import { AIProvider } from "@/lib/config/ai-providers"
import { LLMSelector } from "@/components/biz/LLMSelector"

interface LLMSelectorButtonProps {
    disabled?: boolean
  }

const LLMSelectorButton: React.FC<LLMSelectorButtonProps> = ({
    disabled = false,
  }) => {
    const { options, loading } = useLLMOptions()
    const { provider, model, setLLM } = useLLMSelectorContext()

    const handleLLMChange = (provider: AIProvider, model: string) => {
      setLLM(provider, model)
    }

    return (
      <LLMSelector
        initialData={options}
        selectedProvider={provider}
        selectedModel={model}
        onLLMChange={handleLLMChange}
        placeholder="选择模型"
        disabled={disabled || loading}
      />
    )
  }

export default LLMSelectorButton
