export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <section className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto p-6">{children}</div>
    </section>
  );
}
