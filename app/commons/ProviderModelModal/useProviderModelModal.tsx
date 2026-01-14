import { useProviderModelModalContext } from "./ProviderModelModalContext"

const useProviderModelModal = () => {
  const context = useProviderModelModalContext()

  if (!context) {
    throw new Error(
      "useProviderModelModal must be used within a ProviderModelModalProvider",
    )
  }

  return context
}

export default useProviderModelModal