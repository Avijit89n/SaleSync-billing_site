import welcome from "../../assets/welcome.svg"
import { Badge } from "@/components/ui/badge"
import { Outlet } from "react-router-dom"

export default function AuthLayout() {
    return (
        <div className="opacity-0 animate-fade-in-scale transition-all duration-500 h-screen w-full overflow-hidden bg-neutral-100">
            <div className="grid h-full lg:grid-cols-2">
                <div className="flex flex-col justify-between p-6 sm:p-8 lg:p-12 bg-white">
                    <div className="flex items-center gap-2">
                        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gray-200">
                            <img src="/logo.png" alt="logo" className="h-5 w-5" />
                        </div>
                        <span className="text-lg font-semibold text-neutral-900">
                            SaleSync
                        </span>
                    </div>
                    <div className="flex flex-1 items-center justify-center">
                        <div className="w-full max-w-sm space-y-4">
                            <Outlet/>
                        </div>
                    </div>
                    <p className="text-xs text-neutral-500">
                        © {new Date().getFullYear()} SaleSync
                    </p>
                </div>
                <div className="relative hidden lg:flex items-center justify-center overflow-hidden">
                    <div className="absolute inset-0 bg-neutral-100" />
                    <div
                        className="absolute inset-0"
                        style={{
                            backgroundImage:
                                "linear-gradient(to right, rgba(0,0,0,0.08) 1px, transparent 1px), linear-gradient(to bottom, rgba(0,0,0,0.08) 1px, transparent 1px)",
                            backgroundSize: "32px 32px",
                        }}
                    />
                    <div className="absolute -top-32 -right-32 h-72 w-72 rounded-full bg-orange-300/20 blur-3xl" />
                    <div className="absolute -bottom-40 -left-40 h-72 w-72 rounded-full bg-orange-200/20 blur-3xl" />
                    <div
                        className="relative z-10 w-[88%] max-w-lg rounded-3xl
                       bg-white border
                       shadow-[0_25px_50px_-12px_rgba(0,0,0,0.25)]"
                    >
                        <div className="flex flex-col gap-6 p-8 justify-center items-center">
                            <Badge className={"bg-orange-100 text-orange-600 px-3 py-1 rounded-full text-sm font-medium"}>
                                Sales Platform
                            </Badge>
                            <h2 className="text-2xl text-center font-semibold text-neutral-900 leading-snug">
                                Run your sales.
                                <br />
                                All in one place.
                            </h2>
                            <p className="text-sm text-center text-neutral-600 leading-relaxed">
                                Manage billing, customers, and insights with a clean,
                                reliable platform built for growing teams.
                            </p>
                            <img
                                src={welcome}
                                alt="Dashboard illustration"
                                className="mt-2 translate-x-2.5 w-full max-w-xs self-center object-contain"
                            />
                            <div className="space-y-1 text-xs text-neutral-500 text-center">
                                <p>Welcome back to your sales workspace</p>
                                <p>Track performance, manage customers, and stay in control</p>
                                <p className="text-neutral-400">
                                    Sign in to continue where you left off
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    )
}
