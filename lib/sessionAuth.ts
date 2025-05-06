import { authOptions } from "@/app/api/auth/[...nextauth]/authOptions";
import { getServerSession } from "next-auth";
import { UserProps } from "@/app/api/auth/[...nextauth]/authOptions";
enum StatusType {
  Authenticated = "authenticated",
  Unauthenticated = "unauthenticated",
}
export const sessionAuth = async () => {
  const {user} = await getServerSession(authOptions) as {user : UserProps};
  if (user.role === "FLATMATE") {  
    return {status : StatusType.Unauthenticated , user : user as UserProps}
  }

  return {status : StatusType.Authenticated , user :user as UserProps }
};
