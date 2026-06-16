import Illustration from "./Illustration";
import Brand from "./Brand";

export default function AuthShell({
  children,
  wide = false,
}: {
  children: React.ReactNode;
  wide?: boolean;
}) {
  return (
    <main className="auth-page">
      <section className={`shell${wide ? " wide" : ""}`}>
        <aside className="shell-aside">
          <div className="brand">
            <Brand />
          </div>
          <Illustration />
        </aside>
        <div className="shell-main">{children}</div>
      </section>
    </main>
  );
}
