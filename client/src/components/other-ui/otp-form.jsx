import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
    Field,
    FieldDescription,
    FieldGroup,
    FieldLabel,
} from "@/components/ui/field"
import { NavLink, useLocation, useNavigate } from "react-router-dom"
import { useState } from "react"
import { toast } from "sonner"
import { Spinner } from "../ui/spinner"
import { MailOpen, CheckCircle2, ArrowRight } from "lucide-react"

export default function OTPForm({ className }) {
    const { state } = useLocation()
    const [loading, setLoading] = useState(false)

    const email = state?.email

    const resendEmail = async () => {
        try {
            setLoading(true)
            await new Promise(resolve => setTimeout(resolve, 1500)) 
            toast.success("Verification email sent")
        } catch {
            toast.error("Unable to resend email")
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className={cn("flex flex-col opacity-0 animate-fade-in-scale transition-all duration-500 ", className)}>
            <FieldGroup className="gap-8">
                <div className="flex flex-col items-center gap-4 text-center">
                    <div className="relative">
                        <div className="absolute inset-0 bg-orange-400 blur-2xl opacity-20 rounded-full" />
                        <div className="relative h-18 w-18 bg-linear-to-br from-orange-50 to-orange-100 rounded-2xl border border-orange-200 flex items-center justify-center shadow-sm">
                            <MailOpen className="h-9 w-9 text-orange-600" strokeWidth={1.5} />
                            <div className="absolute -bottom-1 -right-1 bg-white rounded-full p-1 shadow-sm border border-neutral-100">
                                <CheckCircle2 className="h-4 w-4 text-green-500 fill-green-50" />
                            </div>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <h1 className="text-2xl font-bold tracking-tight text-foreground">
                            Check your inbox
                        </h1>
                        <p className="text-muted-foreground text-sm max-w-xs mx-auto text-balance leading-relaxed">
                            We've sent a verification link to the email address associated with your account.
                        </p>
                    </div>
                </div>

                <Field>
                    <FieldLabel className="text-xs uppercase tracking-wider text-muted-foreground font-semibold pl-1">
                        Sent to
                    </FieldLabel>
                    <div className="group relative flex items-center w-full rounded-xl border border-input bg-neutral-50/50 p-1 pr-1 transition-all hover:border-orange-200 hover:bg-orange-50/30">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white border border-neutral-200 shadow-sm text-neutral-500">
                            <span className="text-lg font-bold">@</span>
                        </div>
                        <div className="flex-1 px-3">
                            <p className="text-sm font-medium text-foreground truncate">
                                {email}
                            </p>
                        </div>
                        <div className="pr-2">
                             <div className="h-2 w-2 rounded-full bg-orange-500 animate-pulse" />
                        </div>
                    </div>
                </Field>

                <div className="space-y-4">
                    <Field>
                        <Button
                            className="bg-orange-400 hover:bg-orange-600 w-full h-11 text-base font-medium shadow-md shadow-orange-500/10 transition-all active:scale-[0.98]"
                            onClick={resendEmail}
                            disabled={loading}
                        >
                            {loading ? (
                                <>
                                    <Spinner className="mr-2" /> Sending email...
                                </>
                            ) : (
                                "Resend verification email"
                            )}
                        </Button>
                    </Field>

                    <FieldDescription className="text-center flex items-center justify-center gap-2">
                        Wrong email?{" "}
                        <NavLink 
                            to="/auth/register" 
                            className="group flex items-center gap-1 font-medium text-foreground hover:text-orange-600 transition-colors"
                        >
                            Back to register
                            <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" />
                        </NavLink>
                    </FieldDescription>
                </div>
            </FieldGroup>
        </div>
    )
}