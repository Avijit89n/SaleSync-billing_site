import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { FieldGroup } from "@/components/ui/field"
import { useNavigate, useSearchParams } from "react-router-dom"
import { Check, ArrowRight, ShieldCheck, Loader2, XCircle, AlertCircle } from "lucide-react"
import { useDispatch, useSelector } from "react-redux"
import { toast } from "sonner"
import { useEffect, useState } from "react"
import { directLoginReq, userVarificationReq } from "@/redux/features/authSlice"

export default function EmailVerified() {
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const [userAlreadyVerified, setUserAlreadyVerified] = useState(false)
  const { loading, error } = useSelector((state) => state.auth)

  const [params] = useSearchParams()
  const token = params.get("token")
  const email = params.get("email")

  const handleSubmit = async () => {
    try {
      const res = await dispatch(
        userVarificationReq({ token, email })
      ).unwrap()
      console.log(res);
      setUserAlreadyVerified(res?.data?.user?.varifyChecker || false);
      toast.success(res.message || "Verification successful")
    } catch (err) {
      toast.error(err?.message || "Verification failed")
    }
  }

  const handleLogin = async (e) => {
    e.preventDefault();
    if (userAlreadyVerified) {
      navigate("/auth/login");
      return;
    }
    toast.promise(
      dispatch(directLoginReq({ email })).unwrap(),
      {
        loading: "Logging in...",
        success: (res) => {
          navigate("/user/home");
          return res?.message || "Logged in successfully"
        },
        error: (err) => {
          return err?.message || "something went wrong"
        },
      }
    )
  }

  useEffect(() => {
    if (token && email) {
      handleSubmit()
    }
  }, [token, email])

  if (error || !token || !email) {
    return (
      <div className={"opacity-0 animate-fade-in-scale transition-all duration-500  flex flex-col w-full max-w-sm mx-auto"}>
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
              The verification link is invalid or has expired. Please try registering again or logging in.
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
    )
  }

  if (!loading) {
    return (
      <div className={"flex flex-col w-full max-w-sm mx-auto"}>
        <FieldGroup className="gap-8">
          <div className="flex flex-col items-center text-center gap-6">
            <div className="relative">
              <div className="relative h-24 w-24 bg-green-50 rounded-full border border-green-100 flex items-center justify-center">
                <div className="h-14 w-14 bg-green-600 rounded-full flex items-center justify-center">
                  <Check className="h-7 w-7 text-white" strokeWidth={3} />
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
                Your email has been successfully verified. Your account is now active.
              </p>
            </div>
          </div>

          <div className="w-full bg-white border border-neutral-200 rounded-xl p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-orange-50 flex items-center justify-center border border-orange-100">
                <span className="text-orange-600 font-bold text-lg">
                  <img src="/logo.png" className="h-5 w-5 object-contain" alt="Logo" />
                </span>
              </div>
              <div className="flex flex-col items-start">
                <span className="text-sm font-semibold text-neutral-900">SaleSync Access</span>
                <span className="text-xs text-muted-foreground">Full Platform Access</span>
              </div>
            </div>

            <div className="flex items-center gap-2 bg-green-50 border border-green-200 px-3 py-1 rounded-full">
              <div className="h-1.5 w-1.5 rounded-full bg-green-600 animate-pulse" />
              <span className="text-xs font-semibold text-green-700">Active</span>
            </div>
          </div>

          <div className="space-y-3 pt-2">
            <Button
              className="bg-orange-500 hover:bg-orange-600 w-full text-white text-base font-medium transition-all duration-200 shadow-none"
              size="lg"
              onClick={handleLogin}
            >
              {userAlreadyVerified ? "Login" : "Continue"}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>

        </FieldGroup>
      </div>
    )
  }

  return (
    <div className={"flex flex-col w-full max-w-sm mx-auto"}>
      <FieldGroup className="gap-8 text-center py-8">
        <div className="flex flex-col items-center justify-center gap-4">
          <div className="bg-orange-100 rounded-full h-20 w-20 flex items-center justify-center">
            <div className="h-12 w-12 bg-orange-500 rounded-full border border-orange-100 flex items-center justify-center">
              <Loader2 className="h-6 w-6 text-white animate-spin" />
            </div>
          </div>

          <div className="space-y-1">
            <h2 className="text-lg font-semibold text-neutral-900">Verifying Email...</h2>
            <p className="text-sm text-muted-foreground">
              Securing your account details
            </p>
          </div>
        </div>
      </FieldGroup>
    </div>
  )
}