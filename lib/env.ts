import { createEnv } from "@t3-oss/env-nextjs"
import { z } from "zod"
import "dotenv/config"

export const env = createEnv({
    server: {
        MONGODB_URI: z.string().min(1),
        GITHUB_ID: z.string().min(1),
        GITHUB_SECRET: z.string().min(1),
        DB_MAX_LINK: z.string().default("5"),
    },
    experimental__runtimeEnv: {
        // NEXT_PUBLIC_PUBLISHABLE_KEY: process.env.NEXT_PUBLIC_PUBLISHABLE_KEY,
    },
})