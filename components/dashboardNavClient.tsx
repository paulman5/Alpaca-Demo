"use client";

import {
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Badge } from "@/components/ui/badge";
import {
  Trophy,
  Store,
  FlaskConical,
  BarChart3,
  Users,
  TrendingUp,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useSidebar } from "@/components/ui/sidebar";
import Image from "next/image";
// import CustomConnectWallet from "@/components/custom-connect-wallet";
import React from "react";
import { useAptosWallet } from "@/hooks/aptos/useAptosWallet";
import { useAptosBalance } from "@/hooks/aptos/useAptosBalance";
import { useAptosNetwork } from "@/context/AptosNetworkContext";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";

export function DashboardSidebarNavClient() {
  const { open } = useSidebar();
  const router = useRouter();
  const pathname = usePathname();
  const { isConnected, connect, address, disconnect } = useAptosWallet();
  const { balanceApt, isLoading: isBalanceLoading } = useAptosBalance();
  const { network, setNetwork } = useAptosNetwork();

  const isActive = (path: string) => {
    if (path === "/app") {
      return pathname === "/app";
    }
    return pathname.startsWith(path);
  };

  return (
    <>
      <SidebarHeader className="p-4 border-b">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center">
            <Image
              className="cursor-pointer"
              onClick={() => router.push("/app")}
              src="/Whale.png"
              alt="Spout Finance logo"
              width={32}
              height={32}
            />
          </div>
          {open && (
            <h1
              onClick={() => router.push("/app")}
              className="text-lg font-semibold text-gray-900 cursor-pointer"
            >
              Spout Finance
            </h1>
          )}
        </div>
      </SidebarHeader>
      <SidebarContent className="px-2 py-4">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild isActive={isActive("/app/trade")}>
              <Link href="/app/trade" className="flex items-center gap-3">
                <FlaskConical className="h-4 w-4" />
                <span>Trade</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton asChild isActive={isActive("/app/portfolio")}>
              <Link href="/app/portfolio" className="flex items-center gap-3">
                <Trophy className="h-4 w-4" />
                <span>Portfolio</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton className="flex items-center gap-3 opacity-75 cursor-not-allowed">
              <BarChart3 className="h-4 w-4" />
              <span>Earn</span>
              <Badge
                variant="secondary"
                className="ml-auto bg-secondary/20 text-[#004040] border border-secondary"
              >
                Soon
              </Badge>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              isActive={isActive("/app/proof-of-reserve")}
              className="flex items-center gap-3 opacity-75 cursor-not-allowed"
            >
              <Link
                href="/app"
                className="flex items-center gap-3"
              >
                <TrendingUp className="h-4 w-4" />
                <span>Proof of Reserve</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton className="flex items-center gap-3 opacity-75 cursor-not-allowed">
              <Store className="h-4 w-4" />
              <span>Markets</span>
              <Badge
                variant="secondary"
                className="ml-auto bg-secondary/20 text-[#004040] border border-secondary"
              >
                Soon
              </Badge>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton className="flex items-center gap-3 ">
              <Link href="/app/profile" className="flex items-center gap-3">
                <Users className="h-4 w-4" />
                <span>Profile</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter className="p-4 border-t">
        <div className="space-y-3">
          {/* Network Switcher */}
          <div className="flex items-center justify-between gap-3">
            <span className="text-xs text-gray-600">Network</span>
            <Select value={network} onValueChange={(v) => setNetwork(v as any)}>
              <SelectTrigger className="h-8 w-[130px] rounded-none">
                <SelectValue placeholder="Select network" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="testnet">Testnet</SelectItem>
                <SelectItem value="mainnet">Mainnet</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Aptos connect button or wallet pill */}
          {!isConnected ? (
            <Button
              onClick={connect}
              className="mt-3 bg-black text-white text-sm rounded-none px-4 py-2 border border-gray-600/50 hover:bg-black/90 focus:outline-none"
            >
              Connect Wallet
            </Button>
          ) : (
            <div className="mt-3 flex items-center justify-between gap-3 rounded-none border border-gray-200 bg-gray-50 px-3 py-2">
              <div className="flex min-w-0 items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-green-500" />
                <div className="flex flex-col min-w-0">
                  <span className="text-xs text-gray-600 truncate">
                    {address?.slice(0, 6)}...{address?.slice(-4)}
                  </span>
                  <span className="text-xs font-medium text-gray-900">
                    {isBalanceLoading ? "Loading…" : balanceApt ? `${balanceApt} APT` : "—"}
                  </span>
                </div>
              </div>
              <Button
                variant="secondary"
                onClick={disconnect}
                className="shrink-0 text-xs rounded-none"
              >
                Disconnect
              </Button>
            </div>
          )}
          {/* <SignOutButton className="w-full flex items-center gap-3 px-2 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-none transition-colors">
            <LogOut className="h-4 w-4" />
            <span>Sign Out</span>
          </SignOutButton> */}
          <div className="text-xs text-gray-500 text-center pt-2 border-t">
            © 2024 Spout Finance
          </div>
        </div>
      </SidebarFooter>
    </>
  );
}

export function DashboardNavbarHeaderClient() {
  const pathname = usePathname();

  const isActive = (path: string) => {
    if (path === "/app") {
      return pathname === "/app";
    }
    return pathname.startsWith(path);
  };

  return (
    <header className="flex h-16 shrink-0 items-center justify-between gap-2 border-b bg-white px-4">
      <div className="flex items-center gap-2">
        <div className="md:hidden">
          <SidebarTrigger />
        </div>
        <Link
          href="/app"
          className={`ml-2 text-sm cursor-pointer ${
            isActive("/app")
              ? "text-gray-900 font-medium"
              : "text-gray-600 hover:text-gray-900"
          }`}
        >
          Dashboard
        </Link>
      </div>
    </header>
  );
}
