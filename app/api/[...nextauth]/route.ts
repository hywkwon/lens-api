// 파일 경로: app/api/[...nextauth]/route.ts

import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";

const authOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID, // 구글 클라이언트 ID
      clientSecret: process.env.GOOGLE_CLIENT_SECRET, // 구글 클라이언트 시크릿
    }),
  ],
  // 추가적인 설정을 여기에 작성할 수 있습니다.
};

export { authOptions }; // 명시적으로 authOptions를 export
export default NextAuth(authOptions); // default는 authOptions을 전달하는 방식으로 사용
