import 'next-auth';

declare module 'next-auth' {
  interface User {
    role: string;
    churchId: string | null;
  }

  interface Session {
    user: {
      id: string;
      email: string;
      name: string;
      role: string;
      churchId: string | null;
    };
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    role: string;
    churchId: string | null;
  }
}

