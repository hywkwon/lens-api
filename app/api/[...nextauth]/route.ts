// 파일 경로: app/api/[...nextauth]/route.ts

import NextAuth from "next-auth"; // NextAuth.js를 가져옴
import GoogleProvider from "next-auth/providers/google"; // 구글 로그인 제공자 사용

// 구글 로그인 설정
const authOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID, // 구글 클라이언트 ID
      clientSecret: process.env.GOOGLE_CLIENT_SECRET, // 구글 클라이언트 시크릿
    }),
  ],
  // 추가적인 설정을 여기에 작성할 수 있습니다.
};

// NextAuth.js를 설정하고, authOptions을 전달함
export default NextAuth(authOptions);
