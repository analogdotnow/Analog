import { Link } from "@tanstack/react-router";

export function LegalDisclaimer() {
  return (
    <p className="text-center text-xs text-balance text-muted-foreground">
      By continuing, you agree to our{" "}
      <Link to="/login" className="font-medium text-foreground hover:underline">
        Terms of Service
      </Link>{" "}
      and{" "}
      <Link to="/login" className="font-medium text-foreground hover:underline">
        Privacy Policy
      </Link>
    </p>
  );
}
