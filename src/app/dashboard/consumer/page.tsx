import { cookies } from "next/headers";

export default async function ConsumerDashboard() {
    const cookieStore = await cookies();
    const sessionToken = cookieStore.get("better-auth.session_token");

    let userName = "User";
    try {
        const payload = JSON.parse(
            Buffer.from(sessionToken!.value.split(".")[1], "base64").toString()
        );
        userName = payload.name || "User";
    } catch (e) { }

    return (
        <div>
            <h1 className="text-2xl font-bold text-emerald-800">
                Welcome, {userName}!
            </h1>
            <p className="text-gray-500 mt-2">Consumer Dashboard Overview</p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                {["Pending Bills", "Active Meters", "Open Complaints"].map(
                    (item: string) => (
                        <div
                            key={item}
                            className="bg-white p-4 rounded-lg shadow border border-emerald-100"
                        >
                            <h3 className="text-sm text-gray-500">{item}</h3>
                            <p className="text-2xl font-bold text-emerald-600">0</p>
                        </div>
                    )
                )}
            </div>
        </div>
    );
}