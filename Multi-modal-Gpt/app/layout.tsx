import type {  Metadata, Viewport } from "next";
import { TailwindIndicator } from "~/components/tailwind-indicator";
import { ThemeProvider } from "~/components/theme-provider";
import { ThemeToggle } from "~/components/theme-toggle";
import "~/styles/globals.css";
import { Toaster} from "sonner";
import ClientProvider from "./provider";
import { constructMetadata } from "~/lib/utils";

export const metadata: Metadata = constructMetadata({})

export const viewport: Viewport = {
  colorScheme: "dark",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "white" },
    { media: "(prefers-color-scheme: dark)", color: "black" },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClientProvider>
      <html lang="en">
        <body className="mx-auto min-h-screen w-full scroll-smooth bg-background antialiased">
          <ThemeProvider
            attribute="class"
            defaultTheme="dark"
            enableSystem={false}
          >
            <Toaster />
            {children}
            <ThemeToggle />
            <TailwindIndicator />
          </ThemeProvider>
        </body>
      </html>
    </ClientProvider>
  );
}
