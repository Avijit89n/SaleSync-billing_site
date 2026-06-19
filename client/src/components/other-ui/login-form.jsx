import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
    Field,
    FieldDescription,
    FieldGroup,
    FieldLabel,
    FieldSeparator,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { NavLink, useNavigate } from "react-router-dom" // Added useNavigate
import { useState } from "react"
import { useDispatch, useSelector } from "react-redux" // Added useSelector
import { userLoginReq } from "@/redux/features/authSlice.js"
import { toast } from "sonner"
import { Spinner } from "../ui/spinner"

const initialData = {
    email: "",
    password: "",
}

export function LoginForm({ className, ...props }) {
    const [loginData, setLoginData] = useState(initialData);
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { loading } = useSelector((state) => state.auth);

    const handleSubmit = async (e) => { 
        e.preventDefault();

        toast.promise(
            dispatch(userLoginReq(loginData)).unwrap(),
            {
                loading: "Logging in...",
                success: (res) => {
                    navigate("/user/home");
                    return res?.message || "Login successful ";
                },
                error: (err) => {
                    return err?.message || "something went wrong";
                },
            }
        );
    };


    return (
        <form onSubmit={handleSubmit} className={cn("opacity-0 animate-fade-in-scale transition-all duration-500 flex flex-col gap-6", className)} {...props}>
            <FieldGroup>
                <div className="flex flex-col items-center gap-1 text-center">
                    <h1 className="text-2xl font-bold">Login to your account</h1>
                    <p className="text-muted-foreground text-sm text-balance">
                        Enter your email below to login to your account
                    </p>
                </div>

                <Field>
                    <FieldLabel htmlFor="email">Email</FieldLabel>
                    <Input
                        id="email"
                        type="email"
                        placeholder="abc@example.com"
                        required
                        value={loginData.email}
                        onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
                        disabled={loading} // Disable input while loading
                    />
                </Field>
                <Field>
                    <div className="flex items-center">
                        <FieldLabel htmlFor="password">Password</FieldLabel>
                        <NavLink
                            to={"#"}
                            className="ml-auto text-sm underline-offset-4 hover:underline"
                        >
                            Forgot your password?
                        </NavLink>
                    </div>
                    <Input
                        id="password"
                        type="password"
                        value={loginData.password}
                        onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                        required
                        disabled={loading}
                    />
                </Field>
                <Field>
                    <Button
                        className={"bg-orange-400 hover:bg-orange-600 w-full"}
                        type="submit"
                        disabled={loading}
                    >
                        {loading ? <><Spinner/>Processing</> : "Login"}
                    </Button>
                </Field>

                <FieldSeparator>Or continue with</FieldSeparator>

                <Field>
                    <Button variant="outline" type="button" className="flex items-center gap-2 w-full" disabled={loading}>
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" className="h-5 w-5">
                            <path fill="#EA4335" d="M24 9.5c3.54 0 6.03 1.53 7.42 2.8l5.48-5.48C33.58 3.7 29.28 1.5 24 1.5 14.73 1.5 6.78 6.98 3.05 14.92l6.72 5.22C11.5 14.01 17.3 9.5 24 9.5z" />
                            <path fill="#4285F4" d="M46.5 24.5c0-1.64-.15-3.22-.43-4.75H24v9h12.7c-.55 2.96-2.21 5.47-4.7 7.16l7.2 5.58C43.38 37.66 46.5 31.66 46.5 24.5z" />
                            <path fill="#FBBC05" d="M9.77 28.14A14.5 14.5 0 0 1 9 24.5c0-1.26.22-2.48.63-3.64l-6.72-5.22A23.9 23.9 0 0 0 0 24.5c0 3.84.92 7.48 2.91 10.86l6.86-7.22z" />
                            <path fill="#34A853" d="M24 47.5c6.48 0 11.93-2.14 15.9-5.81l-7.2-5.58c-2 1.35-4.56 2.14-8.7 2.14-6.7 0-12.4-4.51-14.13-10.61l-6.86 7.22C6.73 42.92 14.73 47.5 24 47.5z" />
                        </svg>
                        Login with Google
                    </Button>

                    <FieldDescription className="text-center mt-4">
                        Don&apos;t have an account?{" "}
                        <NavLink to="/auth/register" className="underline underline-offset-4">
                            Sign up
                        </NavLink>
                    </FieldDescription>
                </Field>
            </FieldGroup>
        </form>
    )
}