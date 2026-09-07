import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
    Field,
    FieldDescription,
    FieldGroup,
    FieldLabel,
} from "@/components/ui/field";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { useRef, useState } from "react";
import { useDispatch } from "react-redux";
import { toast } from "sonner";
import { Spinner } from "../../components/ui/spinner";
import {
    MailOpen,
    CheckCircle2,
    ArrowRight,
} from "lucide-react";
import { userVarificationReq } from "../../redux/features/authSlice";

export default function OTP({ className }) {
    const { state } = useLocation();
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const email = state?.email;

    const [otp, setOtp] = useState(["", "", "", "", "", ""]);
    const [loading, setLoading] = useState(false);
    const inputRefs = useRef([]);

    const handleChange = (value, index) => {
        const numericValue = value.replace(/\D/g, "");

        if (!numericValue) {
            const updatedOtp = [...otp];
            updatedOtp[index] = "";
            setOtp(updatedOtp);
            return;
        }

        const updatedOtp = [...otp];
        updatedOtp[index] = numericValue.slice(-1);
        setOtp(updatedOtp);

        if (index < 5) {
            inputRefs.current[index + 1]?.focus();
        }
    };

    const handleKeyDown = (event, index) => {
        if (event.key === "Backspace") {
            if (otp[index]) {
                const updatedOtp = [...otp];
                updatedOtp[index] = "";
                setOtp(updatedOtp);
            } else if (index > 0) {
                inputRefs.current[index - 1]?.focus();
            }
        }

        if (event.key === "ArrowLeft" && index > 0) {
            inputRefs.current[index - 1]?.focus();
        }

        if (event.key === "ArrowRight" && index < 5) {
            inputRefs.current[index + 1]?.focus();
        }
    };

    const handlePaste = (event) => {
        event.preventDefault();

        const pastedValue = event.clipboardData
            .getData("text")
            .replace(/\D/g, "")
            .slice(0, 6);

        if (!pastedValue) return;

        const updatedOtp = ["", "", "", "", "", ""];

        pastedValue.split("").forEach((digit, index) => {
            updatedOtp[index] = digit;
        });

        setOtp(updatedOtp);

        const nextIndex = Math.min(pastedValue.length, 5);
        inputRefs.current[nextIndex]?.focus();
    };

    const handleVerifyOTP = async (event) => {
        event.preventDefault();

        if (!email) {
            toast.error("Email information is missing");
            navigate("/auth/register");
            return;
        }

        const enteredOTP = otp.join("");

        if (enteredOTP.length !== 6) {
            toast.error("Please enter the 6-digit verification code");
            return;
        }

        try {
            setLoading(true);

            const res = await dispatch(
                userVarificationReq({
                    email,
                    token: enteredOTP,
                })
            ).unwrap();

            toast.success(
                res?.message ||
                "Email verified successfully"
            );

            navigate("/auth/login", {
                state: {
                    email,
                    verified: true,
                    approvalStatus: "pending",
                },
            });
        } catch (error) {
            toast.error(
                error?.message ||
                "Invalid or expired verification code"
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <div
            className={cn(
                "flex flex-col opacity-0 animate-fade-in-scale transition-all duration-500",
                className
            )}
        >
            <form onSubmit={handleVerifyOTP}>
                <FieldGroup className="gap-8">
                    <div className="flex flex-col items-center gap-4 text-center">
                        <div className="relative">
                            <div className="absolute inset-0 rounded-full bg-orange-400 opacity-20 blur-2xl" />
                            <div className="relative flex h-18 w-18 items-center justify-center rounded-2xl border border-orange-200 bg-linear-to-br from-orange-50 to-orange-100 shadow-sm">
                                <MailOpen
                                    className="h-9 w-9 text-orange-600"
                                    strokeWidth={1.5}
                                />
                                <div className="absolute -bottom-1 -right-1 rounded-full border border-neutral-100 bg-white p-1 shadow-sm">
                                    <CheckCircle2 className="h-4 w-4 fill-green-50 text-green-500" />
                                </div>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <h1 className="text-2xl font-bold tracking-tight text-foreground">
                                Verify your email
                            </h1>
                            <p className="mx-auto max-w-xs text-balance text-sm leading-relaxed text-muted-foreground">
                                We've sent a 6-digit verification code to your email address.
                            </p>
                        </div>
                    </div>

                    <Field>
                        <FieldLabel className="pl-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                            Email address
                        </FieldLabel>

                        <div className="group relative flex w-full items-center rounded-xl border border-input bg-neutral-50/50 p-1 pr-1 transition-all hover:border-orange-200 hover:bg-orange-50/30">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-neutral-200 bg-white text-neutral-500 shadow-sm">
                                <span className="text-lg font-bold">@</span>
                            </div>

                            <div className="min-w-0 flex-1 px-3">
                                <p className="truncate text-sm font-medium text-foreground">
                                    {email || "Email address"}
                                </p>
                            </div>

                            <div className="pr-2">
                                <div className="h-2 w-2 animate-pulse rounded-full bg-orange-500" />
                            </div>
                        </div>
                    </Field>

                    <Field>
                        <FieldLabel className="pl-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                            Verification code
                        </FieldLabel>

                        <div
                            className="flex justify-center gap-2 sm:gap-3"
                            onPaste={handlePaste}
                        >
                            {otp.map((digit, index) => (
                                <input
                                    key={index}
                                    ref={(element) => {
                                        inputRefs.current[index] = element;
                                    }}
                                    type="text"
                                    inputMode="numeric"
                                    autoComplete={
                                        index === 0
                                            ? "one-time-code"
                                            : "off"
                                    }
                                    maxLength={1}
                                    value={digit}
                                    onChange={(event) =>
                                        handleChange(
                                            event.target.value,
                                            index
                                        )
                                    }
                                    onKeyDown={(event) =>
                                        handleKeyDown(
                                            event,
                                            index
                                        )
                                    }
                                    className={cn(
                                        "h-12 w-11 sm:h-14 sm:w-12",
                                        "rounded-xl border",
                                        "bg-white",
                                        "text-center text-xl sm:text-2xl",
                                        "font-bold text-foreground",
                                        "outline-none",
                                        "transition-all duration-200",
                                        "focus:border-orange-500",
                                        "focus:ring-4",
                                        "focus:ring-orange-500/10",
                                        "hover:border-orange-300",
                                        "shadow-sm"
                                    )}
                                    disabled={loading}
                                />
                            ))}
                        </div>

                        <p className="mt-3 text-center text-xs text-muted-foreground">
                            Enter the 6-digit code from your email.
                        </p>
                    </Field>

                    <Field>
                        <Button
                            type="submit"
                            className="h-11 w-full bg-orange-400 text-base font-medium shadow-md shadow-orange-500/10 transition-all hover:bg-orange-600 active:scale-[0.98]"
                            disabled={loading}
                        >
                            {loading ? (
                                <>
                                    <Spinner className="mr-2" />
                                    Verifying code...
                                </>
                            ) : (
                                <>
                                    Verify email
                                    <ArrowRight className="ml-2 h-4 w-4" />
                                </>
                            )}
                        </Button>
                    </Field>

                    <FieldDescription className="flex items-center justify-center gap-2 text-center">
                        Wrong email?

                        <NavLink
                            to="/auth/register"
                            className="group flex items-center gap-1 font-medium text-foreground transition-colors hover:text-orange-600"
                        >
                            Back to register
                            <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" />
                        </NavLink>
                    </FieldDescription>
                </FieldGroup>
            </form>
        </div>
    );
}
