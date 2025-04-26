"use client";

import { logout } from "@/actions/auth/logout";
import { cn } from "@/lib/utils";
import { Button } from "@nextui-org/react";
import { HiOutlineLogout } from "react-icons/hi";

export const LogoutButton = () => {
    return (
        <Button onClick={async () => await logout()} isIconOnly variant="light">
            <HiOutlineLogout size={20} className={cn("text-red-500")} />
        </Button>
    );
};