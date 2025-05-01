import { authOptions } from "@/app/api/auth/[...nextauth]/authOptions";
import { getServerSession } from "next-auth";
import { UserProps } from "@/app/api/auth/[...nextauth]/authOptions";
enum StatusType {
  Authenticated = "authenticated",
  Unauthenticated = "unauthenticated",
}
export const sessionAuth = async () => {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return {status : StatusType.Unauthenticated , user : null}
  }

  return {status : StatusType.Authenticated , user : session.user as UserProps }
};
