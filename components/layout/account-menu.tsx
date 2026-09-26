"use client";

import Link from "next/link";
import { useRef } from "react";
import { CaretDown, Key, SignOut, UserCircle } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { logout } from "@/features/auth/server/actions";

type AccountMenuProps = {
  fullName: string;
  roleLabel: string;
};

export const AccountMenu = ({ fullName, roleLabel }: AccountMenuProps): React.ReactNode => {
  const logoutForm = useRef<HTMLFormElement>(null);
  return (
    <>
      <form ref={logoutForm} action={logout} hidden />
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="min-h-[var(--control-height)] gap-2 px-2" aria-label={`Akun ${fullName}`}>
            <UserCircle aria-hidden="true" className="size-6" />
            <span className="hidden max-w-40 truncate text-ui font-medium sm:inline">{fullName}</span>
            <CaretDown aria-hidden="true" className="size-3" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56 bg-surface">
          <DropdownMenuLabel className="flex flex-col">
            <span className="truncate">{fullName}</span>
            <span className="text-xs font-normal text-muted-foreground">{roleLabel}</span>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem asChild className="min-h-10 cursor-pointer">
            <Link href="/change-password" className="text-foreground no-underline">
              <Key aria-hidden="true" />
              Ganti password
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem className="min-h-10 cursor-pointer" onSelect={() => logoutForm.current?.requestSubmit()}>
            <SignOut aria-hidden="true" />
            Keluar
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
};
