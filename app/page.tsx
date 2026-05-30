"use client";

import dynamic from "next/dynamic";

const OraclePage = dynamic(() => import("./oracle-page"), { ssr: false });

export default function Page() {
  return <OraclePage />;
}
