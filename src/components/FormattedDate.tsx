"use client";

import { useState, useEffect } from "react";

export default function FormattedDate({ date }: { date: Date | string }) {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    return <>{mounted ? new Date(date).toLocaleString() : new Date(date).toLocaleDateString("en-US")}</>;
}
