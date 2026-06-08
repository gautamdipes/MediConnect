import { cookies } from "next/headers";

export async function setTokenCookie(token?: string) {
  if (!token) {
    return;
  }

  const cookieStore = await cookies();
  cookieStore.set("token", token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
  });
}

export async function storeUserData(user: unknown) {
  if (!user) {
    return;
  }

  const cookieStore = await cookies();
  cookieStore.set("user", JSON.stringify(user), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
  });
}
