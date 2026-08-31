export const metadata = {
  title: "SEO Control Center",
  description: "Technical SEO audit dashboard for EduBazar.shop.",
  robots: { index: false, follow: false },
};

export default function SeoLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
