import { NextPage } from "next";
import { LoginForm } from "@/components/auth/login-form";
import { Suspense } from "react";

const LoginPage: NextPage = async () => {
    return (
        <Suspense>
            <LoginForm />
        </Suspense>
    );
};

export default LoginPage;