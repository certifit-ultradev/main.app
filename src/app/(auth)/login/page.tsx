import { NextPage } from "next";
import { LoginForm } from "@/components/auth/login-form";

const LoginPage: NextPage = async () => {
    return (
        <LoginForm />
    );
};

export default LoginPage;