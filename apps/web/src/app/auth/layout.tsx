import Glow from "@repo/ui/components/ui/glow";
import Header from "~/components/header";

export default function AuthLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <>
      <div className="relative min-h-[100vh]">
        <Header />

        {children}

        <div className="absolute top-[30px] blur-[100px] h-32 w-[1050px] -left-12">
          <Glow />
        </div>
        <div className="absolute bottom-[30px] blur-[100px] h-32 w-[1050px] -right-12 ">
          <Glow align="right" />
        </div>
      </div>
    </>
  );
}

