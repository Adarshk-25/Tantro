/** Route transition: a copper scan line crosses the top edge while content settles in. */
export default function Template({ children }: { children: React.ReactNode }) {
  return (
    <>
      <div className="route-scan" aria-hidden="true" />
      <div className="route-enter">{children}</div>
    </>
  );
}
