"use client";

import { WindowProvider } from "@/context/WindowContext";
import { UserProvider } from "@/context/UserContext";
import Desktop from "@/components/os/Desktop";

export default function Home() {
  return (
    <UserProvider>
      <WindowProvider>
        <Desktop />
      </WindowProvider>
    </UserProvider>
  );
}
