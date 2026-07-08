import { Background } from "@/components/ui/Background";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      {/* z-[1] lifts the canvas above each page's graph-grid wrapper;
          page content sits at z-10 and paints over it. */}
      <div className="pointer-events-none fixed inset-0 z-[1]">
        <Background />
      </div>
      {children}
    </>
  );
}
