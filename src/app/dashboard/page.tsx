import { headers } from "next/headers";
import { auth } from "@/lib/auth";

export default async function ConsumerDashboard() {
    const session = await auth.api.getSession({
        headers: await headers(),
    });

    const userName = session?.user?.name || "User";

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