// app/api/[...nextauth]/route.ts

import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";

const handler = NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  // 다른 설정들이 여기에 들어갈 수 있습니다.
});

export { handler as GET, handler as POST }; // Next.js 13에서는 GET과 POST 메서드를 명시적으로 export
