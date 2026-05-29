import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  beforeLoad: ({ context }) => {
    if (typeof window === "undefined") return;
    const authed = localStorage.getItem("eduvest_auth") === "1";
    throw redirect({ to: authed ? "/home" : "/login" });
  },
  component: () => null,
});
