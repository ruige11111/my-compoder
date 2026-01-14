import { InitialWorkflowContext, WorkflowContext } from "./type"
import { pipe } from "./utils/pipe"
import { withErrorHandling } from "./utils/errorHandling"
import {
    designComponent,
    generateComponent,
    initComponent,
    updateComponent,
  } from "./steps"

type Workflow = (context: InitialWorkflowContext) => Promise<WorkflowContext>

export async function run(workflow: Workflow, context: InitialWorkflowContext) {
    try {
        const result = await workflow(context)
        return {
            success: true,
            data: result.state,
        }
    } catch (error: any) {
        console.error("Workflow failed:", error)
        context.stream.write(error.toString())
        context.stream.close()
    }
}

export const initComponentWorkflow = pipe<
  InitialWorkflowContext,
  WorkflowContext
>(
    withErrorHandling(designComponent),
    withErrorHandling(generateComponent),
    withErrorHandling(initComponent),
)

export const updateComponentWorkflow = pipe<
  InitialWorkflowContext,
  WorkflowContext
>(
  withErrorHandling(designComponent),
  withErrorHandling(generateComponent),
  withErrorHandling(updateComponent),
)