import Link from "next/link"
import { ArrowRight, Heart, Music4, ShieldCheck, Trophy, Users } from "lucide-react"
import { SignInForm } from "@/components/auth/sign-in-form"

const signInHighlights = [
  {
    icon: Music4,
    title: "Resume every live push",
    description: "Jump back into missions, tracker syncing, and chart-checking without hunting around the site."
  },
  {
    icon: Trophy,
    title: "See your state momentum",
    description: "Your dashboard picks up your leaderboard position, mission impact, and ranking context immediately."
  },
  {
    icon: Users,
    title: "Stay aligned with ARMY",
    description: "Move with the same guides, projects, and campaign priorities the rest of the community is tracking."
  }
]

export default function SignInPage() {
  return (
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1.08fr)_minmax(400px,0.92fr)] xl:items-stretch">
      <section className="order-2 relative overflow-hidden rounded-[1.8rem] border border-white/10 bg-[linear-gradient(140deg,rgba(13,10,27,0.94),rgba(8,7,18,0.98))] p-4 shadow-[0_35px_100px_-60px_rgba(0,0,0,0.95)] sm:rounded-[2rem] sm:p-8 lg:p-10 xl:order-1">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(186,146,255,0.18),transparent_30%),radial-gradient(circle_at_85%_18%,rgba(255,153,51,0.16),transparent_22%),radial-gradient(circle_at_50%_100%,rgba(16,185,129,0.12),transparent_28%)]" />
        <div className="absolute -left-10 bottom-10 h-36 w-36 rounded-full bg-[hsl(25,90%,55%)]/10 blur-3xl" />
        <div className="absolute right-0 top-0 h-40 w-40 rounded-full bg-[hsl(265,70%,65%)]/12 blur-3xl" />

        <div className="relative flex h-full flex-col gap-5">
          <div className="hidden w-fit items-center gap-2 rounded-full border border-white/10 bg-white/[0.05] px-4 py-2 text-sm font-medium text-white/78 sm:inline-flex">
            <Heart className="h-4 w-4 text-[hsl(320,65%,70%)]" />
            Welcome back to the streaming hub
          </div>

          <div className="hidden space-y-4 sm:block">
            <h1 className="max-w-[12ch] font-heading text-[2.7rem] font-semibold leading-[0.95] tracking-[-0.055em] text-white sm:text-6xl">
              Step back into India&apos;s BTS push.
            </h1>
            <p className="max-w-2xl text-sm leading-7 text-white/68 sm:text-base sm:leading-8">
              Sign in to reopen the same premium mission flow the rest of the site uses: bold visuals, live campaign
              context, and your own progress ready on arrival.
            </p>
          </div>

          <div className="space-y-3 sm:hidden">
            <p className="text-xs uppercase tracking-[0.28em] text-white/42">Why sign in</p>
            <p className="text-sm leading-6 text-white/68">
              Your missions, state rank, and tracker progress are all waiting inside your dashboard.
            </p>
          </div>

          <div className="flex gap-3 overflow-x-auto pb-1 sm:grid sm:gap-3 md:grid-cols-3">
            {signInHighlights.map((item) => {
              const Icon = item.icon

              return (
                <div
                  key={item.title}
                  className="min-w-[16.5rem] rounded-[1.45rem] border border-white/10 bg-[linear-gradient(135deg,rgba(255,255,255,0.08),rgba(255,255,255,0.03))] p-4 backdrop-blur-sm sm:min-w-0"
                >
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.05] text-[hsl(267,84%,79%)]">
                    <Icon className="h-5 w-5" />
                  </div>
                  <h2 className="mt-4 text-base font-semibold text-white">{item.title}</h2>
                  <p className="mt-2 text-sm leading-6 text-white/58">{item.description}</p>
                </div>
              )
            })}
          </div>

          <div className="flex flex-col gap-3 rounded-[1.6rem] border border-white/10 bg-black/20 p-4 sm:mt-auto sm:flex-row sm:items-center sm:justify-between sm:p-5">
            <div>
              <p className="text-xs uppercase tracking-[0.28em] text-white/42">Need to join first?</p>
              <p className="mt-2 text-sm leading-6 text-white/68">
                Create an account, confirm your state, and start contributing to leaderboard scoring.
              </p>
            </div>
            <Link
              className="inline-flex items-center gap-2 text-sm font-semibold text-white transition hover:text-[hsl(27,95%,64%)]"
              href="/signup"
            >
              Create account
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
              <Heart className="h-7 w-7 fill-current" />
            </div>
            <div className="space-y-2">
              <p className="text-xs uppercase tracking-[0.28em] text-white/45">Sign in</p>
              <h2 className="font-heading text-[2rem] font-semibold tracking-[-0.05em] text-white">Welcome back</h2>
              <p className="text-sm leading-6 text-white/62">
                Use the same account tied to your missions, tracker connections, and leaderboard identity.
              </p>
            </div>
          </div>

          <div className="rounded-[1.4rem] border border-white/10 bg-white/[0.04] p-4 sm:hidden">
            <p className="text-xs uppercase tracking-[0.28em] text-white/45">Quick return</p>
            <p className="mt-2 text-sm leading-6 text-white/68">
              Sign in first. Supporting details and community highlights are just below the form.
            </p>
          </div>

          <div className="rounded-[1.4rem] border border-emerald-400/15 bg-emerald-400/10 p-4">
            <div className="flex items-start gap-3">
              <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-emerald-300" />
              <div>
                <p className="text-sm font-semibold text-white">Secure account access</p>
                <p className="mt-1 text-sm leading-6 text-white/62">
                  Sign-in keeps your confirmed state, leaderboard history, and verified streaming setup attached to one
                  profile.
                </p>
              </div>
            </div>
          </div>

          <SignInForm />
        </div>
      </section>
    </div>
  )
}
