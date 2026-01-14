"use client"

import { useState, useEffect } from "react"
import { ReactCodeRenderer } from "@/app/ReactCodeRenderer"
import { customRequire } from "./customRequire"

type MessageType = "artifacts"

interface ArtifactData {
  entryFile: string
  files: {
    [key: string]: string
  }
}

interface MessagePayload {
  type: MessageType
  data: ArtifactData
}

const HomePage: React.FC = () => {

  const [files, setFiles] = useState<{
    [key: string]: string
  }>({})
  const [entryFile, setEntryFile] = useState<string>("App.tsx")
  const [_, setKey] = useState<number>(0)

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      const { type, data }: MessagePayload = event.data
      if (type === "artifacts") {
        setEntryFile(data.entryFile)
        setFiles(data.files)
        setKey(prevKey => prevKey + 1) // Update the key to force remount
      }
    }

    window.addEventListener("message", handleMessage as EventListener)
    window.parent.postMessage("IFRAME_LOADED", "*")
    return () => {
      window.removeEventListener("message", handleMessage as EventListener)
    }
  }, [])

  const handleError = (errorMessage: string) => {
    // Send error message to parent window
    window.parent.postMessage(
      {
        type: "artifacts-error",
        errorMessage,
      },
      "*",
    )
  }

  const handleSuccess = () => {
    window.parent.postMessage(
      {
        type: "artifacts-success",
      },
      "*",
    )
  }

  return (
    <div>
      {Object.keys(files).length > 0 && (
        <ReactCodeRenderer
          customRequire={customRequire}
          entryFile={entryFile}
          files={files}
          onError={handleError}
          onSuccess={handleSuccess}
        />
      )}
    </div>
  )
}

export default HomePage