export default function HomeLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="-mx-4 -my-8 w-[calc(100%+2rem)] max-w-none">
      {children}
    </div>
  );
}
