import { requireUser } from "@/lib/guards";
import { queryOne } from "@/lib/db";
import { ProfileForm } from "./profile-form";

export const metadata = { title: "Profile" };

export default async function ProfilePage() {
  const sessionUser = await requireUser();
  const user = await queryOne("SELECT name, mobile, bio FROM users WHERE id = ?", [sessionUser.id]);

  return (
    <div className="max-w-xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Profile</h1>
        <p className="mt-1 text-muted-foreground">Update your personal information.</p>
      </div>
      <ProfileForm user={user} />
    </div>
  );
}
