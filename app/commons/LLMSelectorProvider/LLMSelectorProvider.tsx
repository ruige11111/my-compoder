import { AIProvider } from "@/lib/config/ai-providers"
import { LLMSelectorContext } from "./LLMSelectorContext"
import { useState, useMemo, useEffect } from "react"
import { useLLMOptions } from "@/app/commons/LLMSelectorProvider/useLLMOptions"

const STORAGE_KEY_PROVIDER = "llm-selector-provider"
const STORAGE_KEY_MODEL = "llm-selector-model"

interface LLMSelectorProviderProps {
    children: React.ReactNode
    // 可选的默认提供商
    defaultProvider?: AIProvider
    // 可选的默认模型
    defaultModel?: string
    // 可选的状态变化回调
    onChange?: (
      provider: AIProvider | undefined,
      model: string | undefined,
    ) => void
  }

const LLMSelectorProvider: React.FC<LLMSelectorProviderProps> = ({
    children,
    defaultProvider,
    defaultModel,
    onChange,
  }) => {

    const { options, loading, error } = useLLMOptions()

    const [provider, setProviderState] = useState<AIProvider | undefined>(
      defaultProvider,
    )

    const [model, setModelState] = useState<string | undefined>(defaultModel)

    const [isInitialized, setIsInitialized] = useState(false)

    const modelConfig = useMemo(() => {
      return options.find(opt => opt.modelId === model)
    }, [model, options])

    useEffect(() => {
      if (typeof window === "undefined") return

      try {
        const savedProvider = localStorage.getItem(
          STORAGE_KEY_PROVIDER,
        ) as AIProvider | null
        const savedModel = localStorage.getItem(STORAGE_KEY_MODEL)

        if (savedProvider && savedModel) {
          setProviderState(savedProvider)
          setModelState(savedModel)
          if (onChange) {
            onChange(savedProvider, savedModel)
          }
        }
      } catch (error) {
        console.error("Error loading LLM preferences from localStorage:", error)
      } finally {
        setIsInitialized(true)
      }
    }, [])

    const setProvider = (newProvider: AIProvider) => {
      setProviderState(newProvider)

      if (newProvider !== provider) {
        const providerModels = options.filter(opt => opt.provider === newProvider)

        if (providerModels.length > 0) {
          const firstModel = providerModels[0].modelId
          setModelState(firstModel)

          try {
            localStorage.setItem(STORAGE_KEY_PROVIDER, newProvider)
            localStorage.setItem(STORAGE_KEY_MODEL, firstModel)
          } catch (error) {
            console.error("Error saving provider to localStorage:", error)
          }

          if (onChange) {
            onChange(newProvider, firstModel)
          }

        } else {
          setModelState(undefined)

          try {
            localStorage.removeItem(STORAGE_KEY_PROVIDER)
            localStorage.removeItem(STORAGE_KEY_MODEL)
          } catch (error) {
            console.error("Error removing provider from localStorage:", error)
          }

          if (onChange) {
            onChange(newProvider, undefined)
          }
        }

      }
    }

    const setModel = (newModel: string) => {
      setModelState(newModel)

      try {
        if (provider) {
          localStorage.setItem(STORAGE_KEY_MODEL, newModel)
        }
      } catch (error) {
        console.error("Error saving model to localStorage:", error)
      }

      if (onChange) {
        onChange(provider, newModel)
      }
    }

    const setLLM = (newProvider: AIProvider, newModel: string) => {
      setProviderState(newProvider)
      setModelState(newModel)

      try {
        localStorage.setItem(STORAGE_KEY_PROVIDER, newProvider)
        localStorage.setItem(STORAGE_KEY_MODEL, newModel)
      } catch (error) {
        console.error("Error saving LLM to localStorage:", error)
      }

      if (onChange) {
        onChange(newProvider, newModel)
      }
    }

    useEffect(() => {
      if (
        !loading &&
        options.length > 0 &&
        !provider &&
        !model &&
        isInitialized
      ) {
        const defaultProviderOption = options[0].provider
        const defaultModelOption = options[0].modelId

        setProviderState(defaultProviderOption)
        setModelState(defaultModelOption)

        try {
          localStorage.setItem(STORAGE_KEY_PROVIDER, defaultProviderOption)
          localStorage.setItem(STORAGE_KEY_MODEL, defaultModelOption)
        } catch (error) {
          console.error("Error saving default LLM to localStorage:", error)
        }

        if (onChange) {
          onChange(defaultProviderOption, defaultModelOption)
        }
      }
    }, [loading, options, provider, model, isInitialized])

    const contextValue = {
      provider,
      model,
      modelConfig,
      loading,
      error,
      setProvider,
      setModel,
      setLLM,
    }

    return (
      <LLMSelectorContext.Provider value={contextValue}>
        {children}
      </LLMSelectorContext.Provider>
    )
  }

export default LLMSelectorProvider
