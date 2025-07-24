import { SignIn } from "@clerk/nextjs";

export default function Page() {
  return (
    <div className="flex items-center justify-center h-screen">
       <SignIn
  afterSignInUrl="/check-profile"
  afterSignUpUrl="/check-profile"
/>

    </div>
  );
}
