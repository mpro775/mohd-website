import { cookies } from "next/headers";

export const ACCESS_COOKIE = "mohd_access_token";
export const REFRESH_COOKIE = "mohd_refresh_token";

export async function getAccessToken() {
  return (await cookies()).get(ACCESS_COOKIE)?.value;
}

export async function getRefreshToken() {
  return (await cookies()).get(REFRESH_COOKIE)?.value;
}
