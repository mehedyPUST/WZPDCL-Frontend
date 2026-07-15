import { redirect } from "next/navigation";
import { cookies } from "next/headers";

export default async function DashboardPage() {
    const cookieStore = await cookies();
    const sessionToken = cookieStore.get("better-auth.session_token");

    if (!sessionToken) {
        redirect("/login");
    }

    let role = "consumer";
    try {
        const payload = JSON.parse(
            Buffer.from(sessionToken.value.split(".")[1], "base64").toString()
        );
        role = payload.role || "consumer";
    } catch (e) {
        redirect("/login");
    }

    redirect(`/dashboard/${role}`);
}