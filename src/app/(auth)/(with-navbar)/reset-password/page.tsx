import { PasswordResetForm } from "@/components/auth/password-reset-form";
import { NextPage } from "next";


const ResetPasswordPage: NextPage = async () => {
  return (
    <PasswordResetForm />
  );
};

export default ResetPasswordPage;