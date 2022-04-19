import { signOut } from "firebase/auth";
import { useRouter } from "next/router";
import { useEffect } from "react";
import { Button } from "../components/atomic/Button";
import { useUserQuery } from "../generated/graphql";
import { useIsLoggedIn } from "../hooks/useIsLoggedIn";
import { useSignIn } from "../hooks/useSignIn";
import { useUserData } from "../hooks/useUserData";
import { auth } from "../lib/firebase";

export default function Login() {
  const { signInWithGoogle, signingIn } = useSignIn();
  const isLoggedIn = useIsLoggedIn();
  const router = useRouter();
  const { userData } = useUserData();

  useEffect(() => {
    if (userData) {
      router.push("/");
    }
  }, [userData, router]);

  return (
    <div className="p-4">
      {signingIn ? (
        <div>Signing in...</div>
      ) : isLoggedIn ? (
        <div>Redirecting...</div>
      ) : (
        <Button
          onClick={() => {
            signInWithGoogle().then(() => {
              router.push("/");
            });
          }}
        >
          Sign in with Google
        </Button>
      )}
    </div>
  );
}
