import { CalendarLayout } from "@/components/calendar-layout";
import { AuthWrapper } from "@/components/auth/auth-wrapper";

export default function Page() {
  return (
    <AuthWrapper>
      <div className="flex h-dvh w-dvw">
        <CalendarLayout />
      </div>
    </AuthWrapper>
  );
}
