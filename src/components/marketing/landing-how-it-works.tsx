import { Activity, Link2, Target } from "lucide-react"

const steps = [
  {
    number: "01",
    title: "Pick a live mission",
    description: "Open the mission grid and choose the current India, state, or personal goal that fits your session.",
    icon: Target
  },
  {
    number: "02",
    title: "Connect a tracker",
    description: "Link Last.fm, stats.fm, or Musicat so the platform can verify BTS-family listening from your account.",
    icon: Link2
  },
  {
    number: "03",
    title: "Verify and climb",
    description: "Refresh progress, add mission completions, and watch leaderboards plus the India activity map react to the data.",
    icon: Activity
  }
]

export function LandingHowItWorks() {
  return (
    <section className="space-y-10 rounded-[2rem] border border-white/10 bg-black/15 px-5 py-10 sm:px-8 sm:py-12">
      <div className="text-center">
        <p className="text-sm font-semibold uppercase tracking-[0.28em] text-[hsl(265,80%,78%)]">How It Works</p>
        <h2 className="mt-3 font-heading text-3xl font-semibold tracking-tight text-white sm:text-4xl">
          Get started in three simple steps.
        </h2>
        <div className="mx-auto mt-4 h-1 w-20 rounded-full bg-gradient-to-r from-[hsl(265,80%,78%)] to-[hsl(25,90%,60%)]" />
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {steps.map((step) => (
          <div key={step.number} className="rounded-[1.75rem] border border-white/10 bg-white/[0.04] p-6 text-center">
            <div className="text-5xl font-heading font-semibold tracking-[-0.06em] text-white/10">{step.number}</div>
            <div className="mx-auto mt-5 inline-flex h-12 w-12 items-center justify-center rounded-full border border-white/10 bg-white/6">
              <step.icon className="h-5 w-5 text-[hsl(25,90%,60%)]" />
            </div>
            <h3 className="mt-5 text-xl font-semibold text-white">{step.title}</h3>
            <p className="mt-3 text-sm leading-6 text-white/62">{step.description}</p>
          </div>
        ))}
      </div>
    </section>
  )
}
