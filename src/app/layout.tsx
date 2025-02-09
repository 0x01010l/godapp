import { Providers } from "./providers";
import ClientOnly from "../components/ClientOnly";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <Providers>
          <ClientOnly>
            {children}
          </ClientOnly>
        </Providers>
      </body>
    </html>
  );
}