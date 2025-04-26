import { NewPasswordForm } from "@/components/auth/new-password";
import { NextPage } from "next";

const NewPasswordPage: NextPage = async () => {
    return (
        <NewPasswordForm />
    );
};

export default NewPasswordPage;