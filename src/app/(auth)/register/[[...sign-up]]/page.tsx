import { SignUp } from "@clerk/nextjs";

export default function RegisterPage() {
  return (
    <div className="flex items-center justify-center min-h-[60vh] py-12">
      <SignUp path="/register" fallbackRedirectUrl="/dashboard" signInUrl="/login" />
    </div>
  );
}

