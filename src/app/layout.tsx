import type { Metadata } from "next";
import { Inter, Poppins } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import { ThemeProvider } from "@/components/common/ThemeProvider";
import Navbar from "@/components/Navbar";
import { TRPCReactProvider } from "@/trpc/react";
import { Toaster } from "@/components/ui/toaster";
import NextTopLoader from "nextjs-toploader";
import "simplebar-react/dist/simplebar.min.css";

const fontSans = Inter({
	subsets: ["latin"],
	variable: "--font-sans",
});

const poppinsFont = Poppins({weight: ["100", "200", "300", "400", "500", "600", "700"],subsets: ["latin"]})

export const metadata: Metadata = {
	title: "Sphere.",
	description: "Faster research",
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang="en">
			<body className={cn("antialiased grainy", poppinsFont.className)}>
				<TRPCReactProvider>
					<ThemeProvider attribute="class" defaultTheme="system">
						<NextTopLoader />
						<Navbar />
						{children}
						<Toaster />
					</ThemeProvider>
				</TRPCReactProvider>
			</body>
		</html>
	);
}
