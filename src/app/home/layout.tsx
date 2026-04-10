export default function HomeLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="-mx-6 -my-10 w-[calc(100%+3rem)] max-w-none">
      {children}
    </div>
  );
}
