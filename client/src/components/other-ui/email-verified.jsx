import { Button } from "@/components/ui/button";
import { FieldGroup } from "@/components/ui/field";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  Check,
  ArrowRight,
  ShieldCheck,
  Loader2,
  XCircle,
} from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "sonner";
import { useEffect, useRef, useState } from "react";
import {
  directLoginReq,
  userVarificationReq,
} from "@/redux/features/authSlice";

export default function EmailVerified() {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [params] = useSearchParams();

  const token = params.get("token");
  const email = params.get("email");

  const { loading, error } = useSelector((state) => state.auth);

  const [verificationStatus, setVerificationStatus] =
    useState("verifying");

  const [verificationMessage, setVerificationMessage] =
    useState("");

  // Prevent duplicate API calls during the same component lifecycle
  const verificationStarted = useRef(false);

  /**
   * Verify email
   */
  useEffect(() => {
    if (!token || !email) {
      setVerificationStatus("error");
      setVerificationMessage(
        "The verification link is invalid or incomplete."
      );
      return;
    }

    const verificationKey = `email-verification-${email}-${token}`;

    // Already successfully processed this exact verification link
    const alreadyProcessed =
      sessionStorage.getItem(verificationKey);

    if (alreadyProcessed === "success") {
      setVerificationStatus("success");
      setVerificationMessage("Your email has been successfully verified.");
      return;
    }

    // Prevent duplicate calls from React StrictMode
    if (verificationStarted.current) {
      return;
    }

    verificationStarted.current = true;

    const verifyEmail = async () => {
      try {
        setVerificationStatus("verifying");

        const res = await dispatch(
          userVarificationReq({
            token,
            email,
          })
        ).unwrap();

        console.log("Verification response:", res);

        const message =
          res?.message || "Email verified successfully";

        setVerificationMessage(message);

        /**
         * Store success so that if the component remounts
         * with the same URL, it won't call the API again.
         */
        sessionStorage.setItem(
          verificationKey,
          "success"
        );

        setVerificationStatus("success");

        toast.success(message);
      } catch (err) {
        console.error("Email verification error:", err);

        setVerificationStatus("error");

        setVerificationMessage(
          err?.message ||
            "The verification link is invalid or has expired."
        );

        toast.error(
          err?.message ||
            "Email verification failed"
        );
      }
    };

    verifyEmail();
  }, [dispatch, token, email]);

  /**
   * Login after verification
   */
  const handleLogin = async (e) => {
    e.preventDefault();

    if (!email) {
      toast.error("Email address is missing");
      navigate("/auth/login");
      return;
    }

    try {
      await toast.promise(
        dispatch(
          directLoginReq({
            email,
          })
        ).unwrap(),
        {
          loading: "Logging in...",
          success: (res) =>
            res?.message || "Logged in successfully",
          error: (err) =>
            err?.message || "Unable to login",
        }
      );

      navigate("/user/home");
    } catch (err) {
      console.error("Login error:", err);
    }
  };

  /**
   * Invalid / failed verification
   */
  if (
    verificationStatus === "error" ||
    !token ||
    !email
  ) {
    return (
      <div className="opacity-0 animate-fade-in-scale transition-all duration-500 flex flex-col w-full max-w-sm mx-auto">
        <FieldGroup className="gap-6 text-center">
          <div className="flex justify-center">
            <div className="h-20 w-20 bg-orange-50 rounded-full border border-orange-100 flex items-center justify-center">
              <div className="h-12 w-12 bg-orange-500 rounded-full flex items-center justify-center">
                <XCircle className="h-6 w-6 text-white" />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <h1 className="text-xl font-bold tracking-tight text-neutral-900">
              Verification Failed
            </h1>

            <p className="text-muted-foreground text-sm leading-relaxed">
              {verificationMessage ||
                "The verification link is invalid or has expired. Please try registering again or logging in."}
            </p>
          </div>

          <Button
            variant="outline"
            onClick={() => navigate("/auth/login")}
            className="w-full border-neutral-200 hover:bg-neutral-50 hover:text-neutral-900"
          >
            Back to Login
          </Button>
        </FieldGroup>
      </div>
    );
  }

  /**
   * Verification successful
   */
  if (verificationStatus === "success") {
    return (
      <div className="flex flex-col w-full max-w-sm mx-auto">
        <FieldGroup className="gap-8">
          <div className="flex flex-col items-center text-center gap-6">
            <div className="relative">
              <div className="relative h-24 w-24 bg-green-50 rounded-full border border-green-100 flex items-center justify-center">
                <div className="h-14 w-14 bg-green-600 rounded-full flex items-center justify-center">
                  <Check
                    className="h-7 w-7 text-white"
                    strokeWidth={3}
                  />
                </div>

                <div className="absolute -bottom-3 bg-white px-3 py-1.5 rounded-full border border-green-200 flex items-center gap-1.5">
                  <ShieldCheck className="h-3.5 w-3.5 text-green-600" />

                  <span className="text-[10px] font-bold uppercase tracking-wider text-green-700">
                    Secured
                  </span>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <h1 className="text-2xl font-bold tracking-tight text-neutral-900">
                Email Verified
              </h1>

              <p className="text-muted-foreground text-sm max-w-70 mx-auto leading-relaxed">
                Your email has been successfully verified. Your
                account is now active.
              </p>
            </div>
          </div>

          <div className="w-full bg-white border border-neutral-200 rounded-xl p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-orange-50 flex items-center justify-center border border-orange-100">
                <img
                  src="/logo.png"
                  className="h-5 w-5 object-contain"
                  alt="Logo"
                />
              </div>

              <div className="flex flex-col items-start">
                <span className="text-sm font-semibold text-neutral-900">
                  SaleSync Access
                </span>

                <span className="text-xs text-muted-foreground">
                  Full Platform Access
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2 bg-green-50 border border-green-200 px-3 py-1 rounded-full">
              <div className="h-1.5 w-1.5 rounded-full bg-green-600" />

              <span className="text-xs font-semibold text-green-700">
                Active
              </span>
            </div>
          </div>

          <div className="space-y-3 pt-2">
            <Button
              className="bg-orange-500 hover:bg-orange-600 w-full text-white text-base font-medium transition-all duration-200 shadow-none"
              size="lg"
              onClick={handleLogin}
              disabled={loading}
            >
              Login
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </FieldGroup>
      </div>
    );
  }

  /**
   * Verification loading state
   */
  return (
    <div className="flex flex-col w-full max-w-sm mx-auto">
      <FieldGroup className="gap-8 text-center py-8">
        <div className="flex flex-col items-center justify-center gap-4">
          <div className="bg-orange-100 rounded-full h-20 w-20 flex items-center justify-center">
            <div className="h-12 w-12 bg-orange-500 rounded-full border border-orange-100 flex items-center justify-center">
              <Loader2 className="h-6 w-6 text-white animate-spin" />
            </div>
          </div>

          <div className="space-y-1">
            <h2 className="text-lg font-semibold text-neutral-900">
              Verifying Email...
            </h2>

            <p className="text-sm text-muted-foreground">
              Securing your account details
            </p>
          </div>
        </div>
      </FieldGroup>
    </div>
  );
}