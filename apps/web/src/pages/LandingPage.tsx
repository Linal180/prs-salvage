import { Link } from "react-router-dom";
import { Shell } from "../components/ui";

const roles = [
  {
    title: "Insurance Companies",
    body: "List total-loss vehicles, review bids with full visibility, and manage trusted dealers.",
    to: "/register?role=INSURANCE",
  },
  {
    title: "Salvage Dealers",
    body: "Browse company folders, place competitive bids, and build lasting supplier relationships.",
    to: "/register?role=DEALER",
  },
  {
    title: "Private Sellers",
    body: "List an accident-damaged vehicle and choose whether to accept the best offer.",
    to: "/register?role=PRIVATE_SELLER",
  },
];

export function LandingPage() {
  return (
    <Shell>
      <section className="relative overflow-hidden border-b border-line">
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.35]"
          style={{
            backgroundImage:
              "radial-gradient(circle at 12% 20%, #c5e8d1 0%, transparent 42%), radial-gradient(circle at 88% 10%, #e3f4e9 0%, transparent 36%), linear-gradient(180deg, #f7fbf8 0%, #ffffff 70%)",
          }}
        />
        <div className="relative mx-auto grid max-w-6xl gap-10 px-4 py-16 md:grid-cols-[1.15fr_0.85fr] md:items-end md:px-6 md:py-24">
          <div>
            <p className="mb-4 text-xs font-semibold uppercase tracking-[0.22em] text-prs-600">
              Salvage Vehicle Auction Platform
            </p>
            <h1 className="font-display text-5xl font-semibold leading-[1.05] tracking-tight text-prs-800 md:text-6xl lg:text-7xl">
              PRS
            </h1>
            <p className="mt-5 max-w-xl text-lg leading-relaxed text-muted md:text-xl">
              The organized marketplace where insurance companies list salvage
              vehicles, dealers bid with confidence, and every relationship
              stays transparent.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                to="/register"
                className="rounded-md bg-prs-600 px-5 py-3 font-medium text-white hover:bg-prs-700"
              >
                Create account
              </Link>
              <Link
                to="/login"
                className="rounded-md border border-line bg-paper px-5 py-3 font-medium text-ink hover:border-prs-300"
              >
                Login
              </Link>
            </div>
          </div>

          <div className="rounded-xl border border-line bg-paper/80 p-6 shadow-[0_0_0_1px_rgba(27,107,58,0.04)] backdrop-blur">
            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-prs-600">
              How it works
            </p>
            <ol className="mt-4 space-y-4 text-sm leading-relaxed text-muted">
              <li>
                <span className="font-semibold text-ink">1. Register</span> —
                Insurance, dealer, or private seller. Admin approves access.
              </li>
              <li>
                <span className="font-semibold text-ink">2. List or browse</span> —
                Company folders keep inventory organized by insurer.
              </li>
              <li>
                <span className="font-semibold text-ink">3. Bid & close</span> —
                Highest bid wins; payment arranged directly between parties.
              </li>
            </ol>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-14 md:px-6 md:py-16">
        <h2 className="font-display text-3xl font-semibold text-ink">
          Built for how salvage trading actually works
        </h2>
        <p className="mt-3 max-w-2xl text-muted">
          Not a generic auction site. PRS centers insurance–dealer relationships
          through dedicated company folders, fair bidding rules, and clear
          platform policies.
        </p>

        <div className="mt-10 grid gap-4 md:grid-cols-3">
          {roles.map((role) => (
            <Link
              key={role.title}
              to={role.to}
              className="group rounded-xl border border-line bg-paper p-5 transition hover:border-prs-300 hover:bg-prs-50/40"
            >
              <h3 className="font-display text-xl font-semibold text-prs-800 group-hover:text-prs-700">
                {role.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-muted">{role.body}</p>
              <span className="mt-4 inline-block text-sm font-medium text-prs-600">
                Sign up →
              </span>
            </Link>
          ))}
        </div>
      </section>

      <footer className="border-t border-line bg-paper">
        <div className="mx-auto flex max-w-6xl flex-col gap-2 px-4 py-8 text-sm text-muted md:flex-row md:items-center md:justify-between md:px-6">
          <span className="font-display text-lg text-prs-700">PRS</span>
          <span>Phase 1 · Foundation & Access · Pakistan MVP</span>
        </div>
      </footer>
    </Shell>
  );
}
