import { redirect } from "next/navigation";

import { getCurrentUser } from "@/lib/session";

interface UnprotectedLayoutProps {
    children: React.ReactNode;
}

export default async function Auth({ children }: UnprotectedLayoutProps) {
    const user = await getCurrentUser();

    if (user) redirect("/");

    return <>{children}</>;
}
