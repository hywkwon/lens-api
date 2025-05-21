import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";

// NextAuth.js 설정
export const authOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,  // Vercel에 설정한 구글 클라이언트 ID
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,  // Vercel에 설정한 구글 클라이언트 시크릿
    }),
  ],
  callbacks: {
    async jwt({ token, account }) {
      if (account) {
        token.accessToken = account.access_token;  // 로그인 후 액세스 토큰 저장
      }
      return token;
    },
    async session({ session, token }) {
      session.accessToken = token.accessToken;  // 세션에 액세스 토큰 추가
      return session;
    },
  },
};

export default NextAuth(authOptions);
