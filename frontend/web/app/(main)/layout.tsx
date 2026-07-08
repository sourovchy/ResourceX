import Footer from "@/components/layout/Footer";
import PageTransition from "@/components/layout/PageTransition";
import PublicNavbar from "@/components/layout/PublicNavbar";

export default function MainLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="flex min-h-screen flex-col">
            <PublicNavbar />
            <div className="flex flex-1 flex-col">
                <PageTransition>{children}</PageTransition>
            </div>
            <Footer />
        </div>
    );
}
