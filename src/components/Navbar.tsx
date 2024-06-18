import React from "react";
import MaxwidthWrapper from "./common/MaxwidthWrapper";
import Link from "next/link";
import { Button, buttonVariants } from "./ui/button";
import { ModeToggle } from "./ui/ModeToggle";
import { createClient } from "@/lib/supabase/server";
import LogoutButton from "./common/UserProfile";
import UserProfile from "./common/UserProfile";

const Navbar = async () => {
	const supabase = createClient();
	const { data, error } = await supabase.auth.getUser();
	const user = data?.user;

	return (
		<nav className="sticky h-14 inset-x-0 top-0 z-30 w-full border-b bg-background/50 backdrop-blur-lg transition-all">
			<div className="px-14">
				<div className="flex h-14 items-center justify-between">
					<Link href="/" className="flex z-40 font-semibold">
						Sphere<span className="text-red-500">.</span>
					</Link>
					<div className="hidden items-center space-x-4 sm:flex">
						<>
							{user ? (
								<>
									<Link className={buttonVariants({ variant: "ghost", size: "sm" })} href="/dashboard">
										Dashboard
									</Link>
									<UserProfile user={user} />
								</>
							) : (
								<>
									<Link className={buttonVariants({ variant: "ghost", size: "sm" })} href="/login">
										Sign in
									</Link>
								</>
							)}
							<ModeToggle />
						</>
					</div>
				</div>
			</div>
		</nav>
	);
};

export default Navbar;
