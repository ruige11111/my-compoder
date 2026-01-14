import { NextAuthOptions } from "next-auth"
import { MongoDBAdapter } from "@auth/mongodb-adapter"
import { clientPromise } from "@/lib/db/mongo"
import { Adapter } from "next-auth/adapters"
import GithubProvider from "next-auth/providers/github"
import { env } from "@/lib/env"
import tunnel from "tunnel"

const proxyAgent = tunnel.httpsOverHttp({
  proxy: {
      host: '127.0.0.1',
      port: 7897
  }
})

export const authOptions: NextAuthOptions = {
    debug: true,
    adapter: MongoDBAdapter(clientPromise) as Adapter,
    providers: [
      GithubProvider({
        clientId: env.GITHUB_ID,
        clientSecret: env.GITHUB_SECRET,
        allowDangerousEmailAccountLinking: true,
        httpOptions: {
          timeout: 30000,
          agent: proxyAgent,
        },
      }),
    ],
    callbacks: {
      session: async ({ session, user }) => {
        if (session?.user) {
          session.user.id = user.id
        }
        return session
      },
    },
  }