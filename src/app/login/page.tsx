"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { createClient } from "@/lib/supabase/client";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

const loginSchema = z.object({
	email: z.string().email(),
	password: z.string().min(4, { message: "Password must be at least 4 characters" }),
});

export default function LoginPage() {
	const supabase = createClient();
	const router = useRouter();
	const [loading, setLoading] = useState<boolean>(true);
	const [buttonLoading, setButtonLoading] = useState<boolean>(false);
	const [isSignup, setIsSignup] = useState<boolean>(false);

	useEffect(() => {
		(async () => {
			const { data } = await supabase.auth.getUser();
			if (data.user) {
				router.replace("/dashboard");
			} else {
				setLoading(false);
			}
		})();
	}, []);

	const form = useForm<z.infer<typeof loginSchema>>({
		resolver: zodResolver(loginSchema),
		defaultValues: {
			email: "",
			password: "",
		},
	});

	function resetFields() {
		form.reset();
		setIsSignup(!isSignup);
	}

	async function submit(values: z.infer<typeof loginSchema>) {
		setButtonLoading(true);

		try {
			const response = await fetch(`/api/user/${isSignup ? "register" : "login"}`, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify(values),
			});

			const json = await response.json();
			const status = response.status;
			if (status != 200) {
				form.setError("email", {
					message: json.message,
				});
				setButtonLoading(false);
				return;
			}
		} catch (e: any) {
			form.setError("email", {
				message: e.message,
			});
			setButtonLoading(false);
			return;
		}

		router.replace("/dashboard");
		router.refresh();
	}

	return (
		<>
			{loading ? (
				<div className="mt-[8rem]">
					<Loader2 className="mx-auto my-auto h-6 w-6 animate-spin" />
				</div>
			) : (
				<Card className="mx-auto max-w-sm mt-[8rem]">
					<CardHeader>
						<CardTitle className="text-2xl">{isSignup ? "Register" : "Login"}</CardTitle>
						<CardDescription>Enter your email below to {isSignup ? "register" : "login to"} your account</CardDescription>
					</CardHeader>
					<CardContent>
						<Form {...form}>
							<form onSubmit={form.handleSubmit(submit)} className="grid gap-4">
								<FormField
									control={form.control}
									name="email"
									render={({ field }) => (
										<div className="grid gap-2">
											<FormItem>
												<FormLabel>Email</FormLabel>
												<FormControl>
													<Input placeholder="Enter your email" {...field} />
												</FormControl>
												<FormMessage />
											</FormItem>
										</div>
									)}
								/>
								<FormField
									control={form.control}
									name="password"
									render={({ field }) => (
										<div className="grid gap-2">
											<FormItem>
												<FormLabel>Password</FormLabel>
												<FormControl>
													<Input type="password" placeholder="Enter your password" {...field} />
												</FormControl>
												<FormMessage />
											</FormItem>
										</div>
									)}
								/>
								<Button type="submit" className="w-full">
									{buttonLoading ? (
										<Loader2 className="mx-auto my-auto h-6 w-6 animate-spin" />
									) : isSignup ? (
										"Register"
									) : (
										"Login"
									)}
								</Button>
							</form>
						</Form>
						<div className="mt-4 text-center text-sm">
							{!isSignup ? "Don't have" : "Have"} an account?{" "}
							<Link href="#" className="underline" onClick={resetFields}>
								{isSignup ? "Login" : "Sign Up"}
							</Link>
						</div>
					</CardContent>
				</Card>
			)}
		</>
	);
}
