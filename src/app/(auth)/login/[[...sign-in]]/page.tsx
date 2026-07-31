import { SignIn } from "@clerk/nextjs";

export default function LoginPage() {
  return (
    <div className="flex items-center justify-center min-h-[60vh] py-12">
      <SignIn path="/login" fallbackRedirectUrl="/dashboard" signUpUrl="/register" />
    </div>
  );
}

