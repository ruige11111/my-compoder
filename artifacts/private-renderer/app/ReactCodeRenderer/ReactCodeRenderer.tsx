import {
    DynamicComponentRendererProps,
    ModuleCache,
    ExportsObject,
  } from "./interface"
import { ErrorBoundary } from "./ErrorBoundary"
import { useState, useEffect } from "react"
import { transform } from "@babel/standalone"
import path from "path-browserify"
import { ErrorDisplay } from "./ErrorDisplay"

declare global {
  interface Window {
    _moduleImportMap: {
      [importPath: string]: {
        importingFile: string
        importedModule: string
      }
    }
  }
}

const DynamicComponentRenderer: React.FC<DynamicComponentRendererProps> = ({
    files,
    entryFile,
    customRequire,
    onError,
    onSuccess,
  }) => {

    const [Component, setComponent] = useState<React.ComponentType | null>(null)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
      const modules: ModuleCache = {}

      const processFile = (filename: string): any => {
        if (modules[filename]) {
          return modules[filename].exports
        }

        const code = files[filename]
        if (!code) {
          throw new Error(`File not found: ${filename}`)
        }

        const transformedCode = transform(code, {
          filename,
          presets: ["react", "env", "typescript"],
          plugins: ["transform-modules-commonjs"],
        }).code

        const exports: ExportsObject = {}

        const myModule = { exports }

        const ComponentModule = new Function(
          "require",
          "module",
          "exports",
          "__filename",
          "React",
          transformedCode!,
        )

        ComponentModule(
          (importPath: string) => {
            const resolvedPath = importPath.startsWith(".")
              ? path.join(path.dirname(filename), importPath).replace(/^\//, "")
              : importPath

            const possiblePaths = [
              resolvedPath,
              resolvedPath + ".ts",
              resolvedPath + ".tsx",
              resolvedPath + "/index.ts",
              resolvedPath + "/index.tsx",
              resolvedPath.replace(/\.(ts|tsx)$/, ""),
            ]

            const normalizedPath = Object.keys(files).find(file =>
              possiblePaths.includes(file),
            )

            if (normalizedPath) {
              try {
                const result = processFile(normalizedPath)

                if (
                  result === undefined ||
                  (typeof result === "object" &&
                    Object.keys(result).length === 0 &&
                    !result.default)
                ) {
                  throw new Error(
                    `Module "${importPath}" imported in "${filename}" doesn't have any exports. Make sure you've correctly exported components/functions from this module.`,
                  )
                }

                return result
              } catch (error) {
                if (error instanceof Error) {
                  throw new Error(
                    `Error while processing import "${importPath}" in "${filename}": ${error.message}`,
                  )
                }
                throw error
              }
            }

            try {
              const externalModule = customRequire(importPath)

              const importRecord = {
                importingFile: filename,
                importedModule: importPath,
              }

              if (!window._moduleImportMap) {
                window._moduleImportMap = {}
              }
              window._moduleImportMap[importPath] = importRecord

              return new Proxy(externalModule, {
                get: (target, prop) => {
                  if (
                    typeof prop === "symbol" ||
                    prop.toString().startsWith("_")
                  ) {
                    return target[prop]
                  }

                  if (prop in target) {
                    const value = target[prop]

                    if (value === undefined && prop !== "default") {
                      throw new Error(
                        `Component "${String(
                          prop,
                        )}" exists in module "${importPath}" but its value is undefined. This may indicate a packaging or export issue with the module.`,
                      )
                    }
                    return value
                  }

                  const keys = Object.keys(target)

                  const similarNames = keys.filter(
                    k =>
                      k.toLowerCase() === String(prop).toLowerCase() ||
                      k.replace(/[_-]/g, "") ===
                        String(prop).replace(/[_-]/g, ""),
                  )

                  if (similarNames.length > 0) {
                    const suggestions = similarNames.join(", ")
                    throw new Error(
                      `Component "${String(
                        prop,
                      )}" does not exist in module "${importPath}". Did you mean: ${suggestions}?`,
                    )
                  }

                  throw new Error(
                    `Component "${String(
                      prop,
                    )}" does not exist in module "${importPath}". Available components are: ${Object.keys(
                      target,
                    ).join(", ")}.`,
                  )
                }
              })
            } catch (error) {
              // 处理外部库加载错误
              if (error instanceof Error) {
                // 如果错误信息已经是我们的自定义错误，直接传递
                if (error.message.includes("does not exist in module")) {
                  throw error
                }
                throw new Error(
                  `Error loading external module "${importPath}": ${error.message}`,
                )
              }
              throw error
            }
          },
          myModule,
          exports,
          filename,
          require("react"),
        )

        modules[filename] = myModule

        return myModule.exports
      }

      const parseComponents = async () => {
        try {
          setError(null)
          processFile(entryFile)

          const exportedComponent = modules[entryFile].exports.default
          if (!exportedComponent) {
            const errorMsg = `Component not found: The default export from "${entryFile}" is undefined. Please check if you've correctly exported your component with "export default YourComponent".`
            setError(errorMsg)
            onError(errorMsg)
            return
          }

          setComponent(() => exportedComponent)

          onSuccess()
        } catch (error: any) {
          console.error("parseComponents error:", error)

          const undefinedComponentMatch = error.message.match(
            /type is invalid.*?but got: undefined.*?You likely forgot to export/i,
          )
          const missingComponentMatch = error.message.match(
            /Component "([^"]+)" does not exist in module "([^"]+)"/,
          )

          if (missingComponentMatch) {
            // 直接使用我们的自定义错误信息
            setError(error.message)
            onError(error.message)
          } else if (undefinedComponentMatch) {
            const componentNameMatch = error.stack?.match(/at ([A-Za-z0-9_]+) \(/)
            const componentName = componentNameMatch
              ? componentNameMatch[1]
              : "Unknown"

            const importSourceMatch = error.stack?.match(/from ['"]([^'"]+)['"]/)
            const importSource = importSourceMatch
              ? importSourceMatch[1]
              : "a module"

            const enhancedErrorMsg = `Missing component error: The component "${componentName}" being rendered is undefined. This often happens when you import a non-existent component (e.g., from ${importSource}). Please check your imports and make sure all components exist in their respective packages.`

            setError(enhancedErrorMsg)
            onError(enhancedErrorMsg)
          } else {
            setError("parse component error: " + error.message)
            onError("parse component error: " + error.message)
          }
        }
      }

      parseComponents()
    }, [files, entryFile, customRequire, onError])

    if (error) {
      return <ErrorDisplay errorMessage={error} />
    }

    if (!Component) {
      return null
    }

    return (
      <ErrorBoundary onError={onError} files={files}>
        <Component />
      </ErrorBoundary>
    )
  }

export default DynamicComponentRenderer
