import Loader1 from '@/components/loaders/loader1'
import { useSelector } from 'react-redux'
import {
    Navigate,
    useLocation,
    useSearchParams,
} from 'react-router-dom'
import { toast } from 'sonner'

function Direction({ children }) {

    const location = useLocation()
    const { isAuthenticated, loading } = useSelector(state => state.auth)
    const [params] = useSearchParams()

    const token = params.get('token')
    const email = params.get('email')
    const verificationEmail = location.state?.email

    const isAuthRoute = location.pathname.startsWith('/auth')
    const isUserRoute = location.pathname.startsWith('/user')
    const isEmailVerifyRoute = location.pathname.startsWith('/auth/email-verify')
    const isVerificationRoute = location.pathname.startsWith('/auth/verification')

    if(loading) return <Loader1 />


    if (!isAuthenticated && isUserRoute) {
        return <Navigate to="/auth/login" replace />
    }

    if (isAuthenticated && isAuthRoute) {
        return <Navigate to="/user/home" replace />
    }

    if (isEmailVerifyRoute && (!token || !email)) {
        return <Navigate to="/auth/login" replace />
    }

    if (isVerificationRoute && !verificationEmail) {
        return <Navigate to="/auth/login" replace />
    }

    return children
}

export default Direction
