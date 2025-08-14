"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Wine,
  Package,
  Users,
  ShoppingCart,
  MessageSquare,
  Mail,
  Settings,
  LogOut,
  Globe,
  Grape,
  Heart,
} from "lucide-react";

const navigation = [
  { name: "Dashboard", href: "/admin", icon: LayoutDashboard },
  { name: "Wines", href: "/admin/wines", icon: Wine },
  { name: "Accessories", href: "/admin/accessories", icon: Package },
  { name: "Gifts", href: "/admin/gifts", icon: Heart },
  { name: "Orders", href: "/admin/orders", icon: ShoppingCart },
  { name: "Customers", href: "/admin/customers", icon: Users },
  {
    name: "Categories",
    icon: Package,
    children: [
      { name: "Countries", href: "/admin/countries", icon: Globe },
      { name: "Wine Types", href: "/admin/wine-types", icon: Wine },
      {
        name: "Accessory Types",
        href: "/admin/accessory-types",
        icon: Package,
      },
      // { name: 'Grapes', href: '/admin/grapes', icon: Grape },
      // { name: 'Pairings', href: '/admin/pairings', icon: Heart },
    ],
  },
  { name: "Messages", href: "/admin/messages", icon: MessageSquare },
  { name: "Newsletter", href: "/admin/newsletter", icon: Mail },
];

export default function Sidebar() {
  const pathname = usePathname();

  const handleLogout = () => {
    document.cookie =
      "admin-token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;";
    window.location.href = "/admin/login";
  };

  return (
    <div className="flex flex-col h-screen w-64 bg-gray-900 text-white">
      {/* Logo */}
      <div className="flex items-center justify-center h-16 bg-gray-800">
        <Wine className="h-8 w-8 text-red-400" />
        <span className="ml-2 text-lg font-bold">Wine Admin</span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-6 space-y-2">
        {navigation.map((item) => {
          if (item.children) {
            return (
              <div key={item.name} className="space-y-1">
                <div className="flex items-center px-3 py-2 text-sm font-medium text-gray-300">
                  <item.icon className="mr-3 h-5 w-5" />
                  {item.name}
                </div>
                <div className="ml-6 space-y-1">
                  {item.children.map((child) => (
                    <Link
                      key={child.name}
                      href={child.href}
                      className={cn(
                        "flex items-center px-3 py-2 text-sm rounded-md transition-colors",
                        pathname === child.href
                          ? "bg-red-600 text-white"
                          : "text-gray-300 hover:bg-gray-700 hover:text-white"
                      )}
                    >
                      <child.icon className="mr-3 h-4 w-4" />
                      {child.name}
                    </Link>
                  ))}
                </div>
              </div>
            );
          }

          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors",
                pathname === item.href
                  ? "bg-red-600 text-white"
                  : "text-gray-300 hover:bg-gray-700 hover:text-white"
              )}
            >
              <item.icon className="mr-3 h-5 w-5" />
              {item.name}
            </Link>
          );
        })}
      </nav>

      {/* Logout */}
      <div className="p-4 border-t border-gray-700">
        <button
          onClick={handleLogout}
          className="flex items-center w-full px-3 py-2 text-sm font-medium text-gray-300 rounded-md hover:bg-gray-700 hover:text-white transition-colors"
        >
          <LogOut className="mr-3 h-5 w-5" />
          Logout
        </button>
      </div>
    </div>
  );
}
