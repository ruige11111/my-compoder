import { Component, ErrorInfo } from "react"
import { ErrorBoundaryProps, ErrorBoundaryState } from "./interface"
import { ErrorDisplay } from "../ErrorDisplay"

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {

  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = {
      hasError: false,
      errorMessage: null,
    }
  }

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("ErrorBoundary caught an error", error, errorInfo)

    const enhancedErrorMessage = this.processErrorMessage(error, errorInfo)

    this.setState({ errorMessage: enhancedErrorMessage, errorInfo })

    this.props.onError(enhancedErrorMessage)
  }

  processErrorMessage(error: Error, errorInfo: ErrorInfo): string {
    const undefinedComponentMatch = error.message.match(
      /type is invalid.*?but got: undefined.*?You likely forgot to export/i,
    )

    if (undefinedComponentMatch) {
      let componentName = "Unknown"
      let importSource = "unknown module"

      if (errorInfo.componentStack) {
        const componentMatch = errorInfo.componentStack.match(
          /\s+at\s+([A-Za-z0-9_]+)/,
        )

        if (componentMatch && componentMatch[1]) {
          componentName = componentMatch[1]
        }

        const lines = error.stack?.split("\n") || []

        for (const line of lines) {
          const moduleMatch = line.match(/from ['"]([^'"]+)['"]/)
          if (moduleMatch) {
            importSource = moduleMatch[1]
            break
          }
        }
      }

      return `Component error: The component "${componentName}" being rendered is undefined. This likely happens when:
1. You're importing a component that doesn't exist in "${importSource}"
2. You've misspelled the component name during import or usage
3. The component exists but wasn't properly exported

Check your imports and component usage.`
    }

    return error.message
  }

  componentDidUpdate(prevProps: ErrorBoundaryProps) {
    if (this.state.hasError && this.props.files !== prevProps.files) {
      this.setState({
        hasError: false,
        errorMessage: null,
        errorInfo: null,
      })
    }
  }

  render() {
    if (this.state.hasError) {
      return <ErrorDisplay errorMessage={this.state.errorMessage} />
    }
    return this.props.children
  }
}

export default ErrorBoundary
