import Link from "next/link"
import { ArrowRight, MapPin, Music4, ShieldCheck, Sparkles, Trophy } from "lucide-react"
import { SignUpForm } from "@/components/auth/sign-up-form"

const signupSteps = [
  {
    icon: Sparkles,
    title: "Pick your ARMY identity",
    description: "Your username becomes the name people see on missions, rankings, and community spaces."
  },
  {
    icon: MapPin,
    title: "Lock in your state",
    description: "State is what leaderboard scoring trusts. City stays optional for map precision only."
  },
  {
    icon: Music4,
    title: "Connect your tracker next",
    description: "After signup, link Last.fm, stats.fm, or Musicat so verified streaming counts properly."
  },
  {
    icon: Trophy,
    title: "Start moving the charts",
    description: "Your dashboard opens with live missions, guides, and leaderboard momentum ready to follow."
  }
]

export default function SignUpPage() {
  return (
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1.06fr)_minmax(420px,0.94fr)] xl:items-stretch">
      <section className="order-2 relative overflow-hidden rounded-[1.8rem] border border-white/10 bg-[linear-gradient(140deg,rgba(13,10,27,0.94),rgba(8,7,18,0.98))] p-4 shadow-[0_35px_100px_-60px_rgba(0,0,0,0.95)] sm:rounded-[2rem] sm:p-8 lg:p-10 xl:order-1">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(186,146,255,0.18),transparent_30%),radial-gradient(circle_at_82%_20%,rgba(255,153,51,0.18),transparent_24%),radial-gradient(circle_at_52%_100%,rgba(16,185,129,0.12),transparent_28%)]" />
        <div className="absolute -left-10 bottom-10 h-36 w-36 rounded-full bg-[hsl(25,90%,55%)]/10 blur-3xl" />
        <div className="absolute right-0 top-0 h-40 w-40 rounded-full bg-[hsl(265,70%,65%)]/12 blur-3xl" />

        <div className="relative flex h-full flex-col gap-5">
          <div className="hidden w-fit items-center gap-2 rounded-full border border-white/10 bg-white/[0.05] px-4 py-2 text-sm font-medium text-white/78 sm:inline-flex">
            <Sparkles className="h-4 w-4 text-[hsl(267,84%,79%)]" />
            Join India&apos;s ARMY command center
          </div>

          <div className="hidden space-y-4 sm:block">
            <h1 className="max-w-[12ch] font-heading text-[2.7rem] font-semibold leading-[0.95] tracking-[-0.055em] text-white sm:text-6xl">
              Start your account in the same premium theme as the rest of the site.
            </h1>
            <p className="max-w-2xl text-sm leading-7 text-white/68 sm:text-base sm:leading-8">
              Signup should feel like part of the product, not a separate template. This flow now matches the dark BTS
              x India visual language while keeping the location and tracker onboarding intact.
            </p>
          </div>

          <div className="space-y-3 sm:hidden">
            <p className="text-xs uppercase tracking-[0.28em] text-white/42">What happens next</p>
            <p className="text-sm leading-6 text-white/68">
              Create the account first, confirm your state, then connect your tracker in the next step.
            </p>
          </div>

          <div className="flex gap-3 overflow-x-auto pb-1 sm:grid sm:gap-3 sm:grid-cols-2">
            {signupSteps.map((step, index) => {
              const Icon = step.icon

              return (
                <div
                  key={step.title}
                  className="min-w-[17rem] rounded-[1.45rem] border border-white/10 bg-[linear-gradient(135deg,rgba(255,255,255,0.08),rgba(255,255,255,0.03))] p-4 backdrop-blur-sm sm:min-w-0"
                >
                  <div className="flex items-start gap-4">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.05] text-[hsl(267,84%,79%)]">
                      <Icon className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-[11px] uppercase tracking-[0.28em] text-white/42">Step {index + 1}</p>
                      <h2 className="mt-2 text-base font-semibold text-white">{step.title}</h2>
                      <p className="mt-2 text-sm leading-6 text-white/58">{step.description}</p>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>

          <div className="flex flex-col gap-3 rounded-[1.6rem] border border-white/10 bg-black/20 p-4 sm:mt-auto sm:flex-row sm:items-center sm:justify-between sm:p-5">
            <div>
              <p className="text-xs uppercase tracking-[0.28em] text-white/42">Already a member?</p>
              <p className="mt-2 text-sm leading-6 text-white/68">
                Sign in to reopen your mission dashboard, tracker setup, and leaderboard progress.
              </p>
            </div>
            <Link
              className="inline-flex items-center gap-2 text-sm font-semibold text-white transition hover:text-[hsl(27,95%,64%)]"
              href="/signin"
            >
              Go to sign in
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      <section className="order-1 relative overflow-hidden rounded-[1.8rem] border border-white/10 bg-[linear-gradient(180deg,rgba(16,12,31,0.96),rgba(8,7,18,0.98))] p-5 shadow-[0_35px_100px_-60px_rgba(0,0,0,0.95)] sm:rounded-[2rem] sm:p-7 lg:p-8 xl:order-2">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(186,146,255,0.14),transparent_32%),linear-gradient(180deg,rgba(255,255,255,0.04),transparent_35%)]" />

        <div className="relative space-y-6">
          <div className="space-y-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-[1.6rem] border border-white/10 bg-[linear-gradient(135deg,rgba(186,146,255,0.22),rgba(255,153,51,0.18))] text-white shadow-[0_20px_40px_-25px_rgba(186,146,255,0.8)]">
              <Sparkles className="h-7 w-7" />
            </div>
            <div className="space-y-2">
              <p className="text-xs uppercase tracking-[0.28em] text-white/45">Create account</p>
              <h2 className="font-heading text-[2rem] font-semibold tracking-[-0.05em] text-white">
                Join the leaderboard run
              </h2>
              <p className="text-sm leading-6 text-white/62">
                Confirm your state now, skip city if needed, and move straight into tracker setup after signup.
              </p>
            </div>
          </div>

          <div className="rounded-[1.4rem] border border-white/10 bg-white/[0.04] p-4 sm:hidden">
            <p className="text-xs uppercase tracking-[0.28em] text-white/45">Task first</p>
            <p className="mt-2 text-sm leading-6 text-white/68">
              Account creation is the primary action, so the form stays above the support content on mobile.
            </p>
          </div>

          <div className="rounded-[1.4rem] border border-emerald-400/15 bg-emerald-400/10 p-4">
            <div className="flex items-start gap-3">
              <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-emerald-300" />
              <div>
                <p className="text-sm font-semibold text-white">State-based scoring stays protected</p>
                <p className="mt-1 text-sm leading-6 text-white/62">
                  Location setup remains wired to the existing backend rules, so the visual refresh doesn&apos;t change
                  how ranking eligibility works.
                </p>
              </div>
            </div>
          </div>

          <SignUpForm />
        </div>
      </section>
    </div>
  )
}
