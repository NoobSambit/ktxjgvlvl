"use client"

import { type ReactNode, useState } from "react"
import {
  Check,
  CheckCircle2,
  CreditCard,
  MailCheck,
  Play,
  Search,
  ShieldCheck,
  Smartphone,
  UserRoundPlus,
  WalletCards
} from "lucide-react"
import { GuideModalCtaButton } from "@/components/guides/guide-modal-cta-button"
import { ServiceBrandLogo } from "@/components/guides/service-brand-logo"
import { GuideWalkthroughModal, type GuideWalkthroughSection } from "@/components/guides/guide-walkthrough-modal"

const APPLE_SECTIONS: GuideWalkthroughSection[] = [
  {
    id: "install",
    eyebrow: "Start here",
    title: "Installing Apple Music",
    shortTitle: "Install",
    summary: "Get the official Android app from Google Play first, then open it right away.",
    steps: [
      {
        id: "apple-install-play-store",
        title: "Open the Play Store",
        description: "Go straight to Google Play on your Android device so you install the official app from the correct source.",
        hints: ["Use your regular Android account", "A stable connection avoids install issues"],
        preview: "store"
      },
      {
        id: "apple-install-search",
        title: "Search for Apple Music",
        description: "Type Apple Music, confirm the publisher is Apple, then open the official app listing.",
        hints: ["Ignore clones or unofficial results", "Check the icon before tapping install"],
        preview: "results"
      },
      {
        id: "apple-install-open",
        title: "Install and open the app",
        description: "Tap Install, wait for the download to finish, then open the app so you can move directly into account setup.",
        hints: ["Wi-Fi is faster for the first install", "Open it immediately after install"],
        preview: "launch"
      }
    ]
  },
  {
    id: "apple-id",
    eyebrow: "Account setup",
    title: "Creating Apple ID",
    shortTitle: "Apple ID",
    summary: "Create the account inside Apple Music, verify it, then sign back in with the same ID.",
    steps: [
      {
        id: "apple-id-sign-in",
        title: "Open the sign-in screen",
        description: "Inside Apple Music, tap Sign In. If you are new, choose the create-account option from there.",
        hints: ["You do not need an iPhone", "Stay inside Apple Music for this flow"],
        preview: "signin"
      },
      {
        id: "apple-id-create",
        title: "Create and verify the Apple ID",
        description: "Fill in your email, password, and country details, then complete the email verification Apple sends.",
        hints: ["Use an email you can access instantly", "Check spam if the verification mail is late"],
        preview: "form"
      },
      {
        id: "apple-id-login",
        title: "Sign back in with the new Apple ID",
        description: "Return to Apple Music and log in using the same Apple ID you just created and verified.",
        hints: ["Use the exact email you verified", "This unlocks the subscription flow next"],
        preview: "account"
      }
    ]
  },
  {
    id: "subscription",
    eyebrow: "Payment setup",
    title: "Buying Subscription",
    shortTitle: "Subscription",
    summary: "Use the browser route for billing, then choose the Individual plan and finish inside your account.",
    note: "Family plan note: Android users can join a family plan, but the family plan purchase itself is limited to iOS.",
    steps: [
      {
        id: "apple-sub-browser",
        title: "Open music.apple.com in a browser",
        description: "Use Chrome or another reliable browser, then sign in with the Apple ID you created in the app.",
        hints: ["Browser setup is cleaner on Android", "Use the same Apple ID as the app"],
        preview: "browser"
      },
      {
        id: "apple-sub-payment",
        title: "Add billing address and payment method",
        description: "Go into account settings, fill the billing address, then add a payment method before picking a plan.",
        hints: ["Complete both address and payment details", "Review the information before saving"],
        preview: "payment"
      },
      {
        id: "apple-sub-plan",
        title: "Choose Individual and confirm",
        description: "Open the subscriptions area, choose the Individual plan, finish payment, then go back to the app and start streaming.",
        hints: ["Pick Individual for a direct Android purchase", "Refresh the app if access takes a moment"],
        preview: "plan"
      }
    ]
  }
]

const APPLE_FACTS = [
  {
    label: "Works on",
    value: "Android app + web browser"
  },
  {
    label: "Best flow",
    value: "Install in app, pay in browser"
  },
  {
    label: "Important",
    value: "Family purchase is iOS-only"
  }
]

function getSectionIcon(sectionId: string) {
  switch (sectionId) {
    case "install":
      return <Play className="h-4 w-4" />
    case "apple-id":
      return <UserRoundPlus className="h-4 w-4" />
    default:
      return <WalletCards className="h-4 w-4" />
  }
}

function WindowFrame({
  title,
  children,
  gradient
}: {
  title: string
  children: ReactNode
  gradient: string
}) {
  return (
    <div className="overflow-hidden rounded-[1.6rem] border border-white/15 bg-[rgba(10,7,42,0.86)] shadow-[0_28px_70px_-30px_rgba(0,0,0,0.9)]">
      <div className={`flex items-center justify-between border-b border-white/10 px-4 py-3 ${gradient}`}>
        <div className="flex items-center gap-2">
          <span className="h-3 w-3 rounded-sm border border-white/70 bg-white/40" />
          <span className="h-3 w-3 rounded-sm border border-white/70 bg-white/20" />
          <span className="h-3 w-3 rounded-sm border border-white/70 bg-white/20" />
        </div>
        <span className="text-[10px] font-semibold uppercase tracking-[0.28em] text-white/80">{title}</span>
      </div>
      <div className="p-4">{children}</div>
    </div>
  )
}

function PhoneFrame({ children }: { children: ReactNode }) {
  return (
    <div className="mx-auto w-full max-w-[16.5rem] rounded-[1.8rem] border border-white/15 bg-[linear-gradient(180deg,rgba(255,255,255,0.12),rgba(255,255,255,0.04))] p-2.5 shadow-[0_30px_60px_-30px_rgba(0,0,0,0.85)]">
      <div className="mx-auto mb-2.5 h-1.5 w-16 rounded-full bg-white/15" />
      <div className="overflow-hidden rounded-[1.4rem] border border-white/10 bg-[rgba(8,5,34,0.92)]">
        {children}
      </div>
    </div>
  )
}

function ApplePreview({ kind }: { kind: string }) {
  switch (kind) {
    case "store":
      return (
        <WindowFrame title="Google Play" gradient="bg-gradient-to-r from-fuchsia-400/90 via-violet-400/90 to-indigo-400/90">
          <div className="space-y-4">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-3">
              <div className="flex items-center gap-3 rounded-xl bg-white px-3 py-2 text-slate-900">
                <Search className="h-4 w-4 text-slate-500" />
                <span className="text-sm">Search apps and games</span>
              </div>
            </div>
            <div className="rounded-[1.3rem] border border-white/10 bg-white/95 p-4 text-slate-900">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-rose-500 to-pink-500 text-lg font-bold text-white">
                  A
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-semibold">Apple Music</p>
                  <p className="text-xs text-slate-500">Official publisher: Apple</p>
                </div>
                <div className="rounded-full bg-emerald-500 px-3 py-1 text-xs font-semibold text-white">Install</div>
              </div>
            </div>
          </div>
        </WindowFrame>
      )
    case "results":
      return (
        <WindowFrame title="Search Results" gradient="bg-gradient-to-r from-fuchsia-400/90 via-pink-400/90 to-orange-300/90">
          <div className="space-y-3">
            {["Apple Music", "Apple TV", "Apple Devices"].map((item, index) => (
              <div
                key={item}
                className={`rounded-[1.2rem] border px-4 py-3 ${
                  index === 0
                    ? "border-pink-300 bg-gradient-to-r from-pink-500/20 to-violet-500/20"
                    : "border-white/10 bg-white/5"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`flex h-10 w-10 items-center justify-center rounded-2xl text-sm font-bold ${
                      index === 0 ? "bg-rose-500 text-white" : "bg-white/10 text-white"
                    }`}
                  >
                    {index === 0 ? "A" : item.charAt(0)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-white">{item}</p>
                    <p className="text-xs text-white/[0.55]">
                      {index === 0 ? "Use this one" : "Not the music app"}
                    </p>
                  </div>
                  {index === 0 ? <CheckCircle2 className="h-5 w-5 text-emerald-300" /> : null}
                </div>
              </div>
            ))}
          </div>
        </WindowFrame>
      )
    case "launch":
      return (
        <PhoneFrame>
          <div className="bg-gradient-to-br from-[#ff5f6d] via-[#f34b93] to-[#6457ff] p-4">
            <div className="mb-6 flex items-center justify-between text-white/90">
              <span className="text-xs uppercase tracking-[0.28em]">Apple Music</span>
              <Smartphone className="h-4 w-4" />
            </div>
            <div className="space-y-4 rounded-[1.4rem] bg-white/12 p-4 backdrop-blur-sm">
              <p className="text-sm font-semibold text-white">Ready to open</p>
              <p className="text-sm leading-relaxed text-white/80">
                Install first. Then open the app and move straight to sign-in or account creation.
              </p>
              <div className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-1 text-xs font-semibold text-slate-900">
                <Play className="h-3.5 w-3.5" />
                Open app
              </div>
            </div>
          </div>
        </PhoneFrame>
      )
    case "signin":
      return (
        <PhoneFrame>
          <div className="bg-gradient-to-br from-[#4b2ea7] via-[#b5408a] to-[#ff7b54] p-4">
            <div className="rounded-[1.4rem] bg-[rgba(13,8,44,0.5)] p-4 text-white backdrop-blur-sm">
              <p className="text-xs uppercase tracking-[0.28em] text-white/70">Welcome</p>
              <h3 className="mt-2 text-2xl font-semibold">Get started</h3>
              <p className="mt-3 text-sm text-white/75">Open Sign In first. The create-account option sits right there.</p>
              <div className="mt-4 space-y-2">
                <div className="rounded-xl bg-white px-4 py-2 text-center text-sm font-semibold text-slate-900">Sign In</div>
                <div className="rounded-xl border border-white/20 px-4 py-2 text-center text-sm text-white">Create Apple ID</div>
              </div>
            </div>
          </div>
        </PhoneFrame>
      )
    case "form":
      return (
        <WindowFrame title="Create Apple ID" gradient="bg-gradient-to-r from-violet-400/90 via-fuchsia-400/90 to-pink-400/90">
          <div className="grid gap-3">
            {["Email", "Password", "Verify password", "Country / Region"].map((label) => (
              <div key={label} className="rounded-xl border border-white/10 bg-white px-4 py-3 text-sm text-slate-500">
                {label}
              </div>
            ))}
            <div className="flex items-center gap-2 text-xs text-white/[0.65]">
              <Check className="h-4 w-4 text-emerald-300" />
              Verify the email before trying to subscribe.
            </div>
          </div>
        </WindowFrame>
      )
    case "account":
      return (
        <PhoneFrame>
          <div className="bg-[linear-gradient(180deg,#fff_0%,#f1e8ff_100%)] p-4 text-slate-900">
            <div className="mb-4 text-center">
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-500">Apple ID</p>
              <h3 className="mt-2 text-xl font-semibold">Sign in</h3>
            </div>
            <div className="space-y-3">
              <div className="rounded-xl border border-slate-200 px-4 py-3 text-sm text-slate-400">Apple ID</div>
              <div className="rounded-xl border border-slate-200 px-4 py-3 text-sm text-slate-400">Password</div>
              <div className="rounded-xl bg-rose-500 px-4 py-3 text-center text-sm font-semibold text-white">Continue</div>
            </div>
          </div>
        </PhoneFrame>
      )
    case "browser":
      return (
        <WindowFrame title="music.apple.com" gradient="bg-gradient-to-r from-[#ff65c3] via-[#c56cf0] to-[#7d7dff]">
          <div className="space-y-4">
            <div className="rounded-xl bg-white px-3 py-2 text-sm text-slate-500">https://music.apple.com/account/settings</div>
            <div className="grid gap-3 sm:grid-cols-3">
              {["Apple ID", "Billing address", "Country / Region"].map((item) => (
                <div key={item} className="rounded-2xl border border-white/10 bg-white/5 p-3">
                  <p className="text-xs uppercase tracking-[0.2em] text-white/[0.45]">{item}</p>
                  <p className="mt-2 text-sm font-medium text-white">Set up</p>
                </div>
              ))}
            </div>
          </div>
        </WindowFrame>
      )
    case "payment":
      return (
        <WindowFrame title="Payment Setup" gradient="bg-gradient-to-r from-[#ff73a8] via-[#ff9e58] to-[#ffcf5c]">
          <div className="space-y-3">
            <div className="rounded-xl border border-white/10 bg-white px-4 py-3 text-sm text-slate-500">Billing address</div>
            <div className="rounded-xl border border-white/10 bg-white px-4 py-3 text-sm text-slate-500">Payment type: UPI / card</div>
            <div className="rounded-xl border border-white/10 bg-white px-4 py-3 text-sm text-slate-500">Payment details</div>
            <div className="inline-flex items-center gap-2 rounded-full bg-emerald-400/20 px-3 py-1 text-xs font-medium text-emerald-200">
              <ShieldCheck className="h-3.5 w-3.5" />
              Save billing first, then pick a plan
            </div>
          </div>
        </WindowFrame>
      )
    case "plan":
      return (
        <WindowFrame title="Choose a Plan" gradient="bg-gradient-to-r from-[#ff67cf] via-[#b16cff] to-[#7b8eff]">
          <div className="space-y-4">
            <div className="rounded-[1.4rem] border border-pink-300 bg-white p-4 text-slate-900 shadow-lg shadow-pink-500/10">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Recommended</p>
                  <p className="mt-2 text-lg font-semibold">Individual</p>
                </div>
                <CreditCard className="h-6 w-6 text-pink-500" />
              </div>
              <p className="mt-3 text-sm text-slate-500">Use this plan for a direct Android purchase flow.</p>
            </div>
            <div className="rounded-xl border border-white/10 bg-white/5 p-3 text-sm text-white/70">
              Finish payment here, then jump back to the app and refresh if needed.
            </div>
          </div>
        </WindowFrame>
      )
    default:
      return (
        <WindowFrame title="Verification" gradient="bg-gradient-to-r from-sky-400/90 via-cyan-400/90 to-violet-400/90">
          <div className="rounded-[1.5rem] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.1),rgba(255,255,255,0.03))] p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-400/20 text-emerald-300">
                <MailCheck className="h-6 w-6" />
              </div>
              <div>
                <p className="font-semibold text-white">Verify your email</p>
                <p className="text-sm text-white/[0.65]">Complete the Apple verification prompt before subscribing.</p>
              </div>
            </div>
          </div>
        </WindowFrame>
      )
  }
}

export function AppleMusicAndroidGuide() {
  const [walkthroughOpen, setWalkthroughOpen] = useState(false)
  const [initialStepId, setInitialStepId] = useState<string | null>(null)

  const openWalkthrough = (sectionId?: string) => {
    setInitialStepId(sectionId ? APPLE_SECTIONS.find((section) => section.id === sectionId)?.steps[0]?.id ?? null : null)
    setWalkthroughOpen(true)
  }

  return (
    <>
      <div className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-[linear-gradient(180deg,rgba(35,22,94,0.98),rgba(10,10,58,1))] shadow-[0_35px_120px_-45px_rgba(0,0,0,0.95)]">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute inset-x-0 top-0 h-72 bg-[radial-gradient(circle_at_top,rgba(217,84,255,0.32),transparent_65%)]" />
          <div className="absolute right-[-5rem] top-20 h-72 w-72 rounded-full bg-pink-500/12 blur-3xl" />
          <div className="absolute left-[-4rem] bottom-[-4rem] h-72 w-72 rounded-full bg-violet-500/12 blur-3xl" />
        </div>

        <div className="relative space-y-8 px-4 py-5 sm:px-6 sm:py-6 lg:px-8 lg:py-8">
          <section className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr] xl:items-end">
            <div className="space-y-5">
              <div className="inline-flex items-center gap-2 rounded-full border border-fuchsia-300/20 bg-fuchsia-300/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.24em] text-fuchsia-100">
                <ServiceBrandLogo service="apple" className="h-4 w-4" />
                Apple Music on Android
              </div>

              <div className="space-y-4">
                <p className="text-sm font-medium uppercase tracking-[0.32em] text-fuchsia-200/80">Quick read + guided mode</p>
                <h1 className="font-heading text-4xl font-semibold uppercase leading-[0.95] text-white sm:text-5xl lg:text-6xl">
                  Apple Music
                  <span className="block text-transparent [text-shadow:_0_8px_26px_rgba(255,95,187,0.35)] [-webkit-text-stroke:1px_rgba(255,255,255,0.65)]">
                    For Android
                  </span>
                </h1>
                <p className="max-w-2xl text-sm leading-7 text-white/[0.72] sm:text-base">
                  Keep the main page simple for first-time users: read the steps normally, then open the walkthrough if
                  you want the smaller, phone-style interactive version.
                </p>
              </div>

              <div className="flex flex-wrap gap-3">
                <GuideModalCtaButton
                  accent="apple"
                  label="Open interactive walkthrough"
                  onClick={() => openWalkthrough()}
                  icon={<ServiceBrandLogo service="apple" className="h-4 w-4" />}
                />
                <div className="rounded-full border border-white/15 bg-white/[0.05] px-4 py-3 text-sm text-white/70">
                  Simple list is the default. Guided mode lives in a modal.
                </div>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              {APPLE_FACTS.map((fact) => (
                <div key={fact.label} className="rounded-[1.5rem] border border-white/10 bg-white/[0.05] p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.24em] text-white/[0.45]">{fact.label}</p>
                  <p className="mt-3 text-sm font-medium leading-6 text-white">{fact.value}</p>
                </div>
              ))}
            </div>
          </section>

          <section className="space-y-4">
            {APPLE_SECTIONS.map((section) => (
              <article
                key={section.id}
                className="overflow-hidden rounded-[1.75rem] border border-white/10 bg-[rgba(255,255,255,0.05)] shadow-[0_22px_60px_-38px_rgba(0,0,0,0.95)]"
              >
                <div className="flex flex-col gap-4 border-b border-white/10 px-5 py-5 sm:flex-row sm:items-start sm:justify-between sm:px-6">
                  <div className="flex items-start gap-4">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white text-[#26124f]">
                      {getSectionIcon(section.id)}
                    </div>
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.3em] text-white/[0.45]">{section.eyebrow}</p>
                      <h2 className="mt-2 font-heading text-2xl font-semibold text-white sm:text-3xl">{section.title}</h2>
                      <p className="mt-3 max-w-2xl text-sm leading-6 text-white/[0.72]">{section.summary}</p>
                    </div>
                  </div>
                  <GuideModalCtaButton
                    accent="apple"
                    label="Walk me through it"
                    onClick={() => openWalkthrough(section.id)}
                    compact
                    icon={<ServiceBrandLogo service="apple" className="h-3.5 w-3.5" />}
                  />
                </div>

                <div className="grid gap-3 px-5 py-5 sm:px-6 lg:grid-cols-3">
                  {section.steps.map((step, index) => (
                    <div key={step.id} className="rounded-[1.4rem] border border-white/10 bg-[#120d39]/70 p-4">
                      <div className="flex items-start gap-3">
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-white text-sm font-semibold text-[#26124f]">
                          {index + 1}
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-white">{step.title}</h3>
                          <p className="mt-2 text-sm leading-6 text-white/[0.7]">{step.description}</p>
                        </div>
                      </div>
                      <div className="mt-4 flex flex-wrap gap-2">
                        {step.hints.map((hint) => (
                          <span key={hint} className="rounded-full bg-white/[0.08] px-3 py-1 text-xs text-white/75">
                            {hint}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>

                {section.note ? (
                  <div className="border-t border-white/10 px-5 py-4 sm:px-6">
                    <div className="rounded-[1.2rem] border border-fuchsia-300/20 bg-fuchsia-300/10 p-4 text-sm leading-6 text-fuchsia-50">
                      {section.note}
                    </div>
                  </div>
                ) : null}
              </article>
            ))}
          </section>
        </div>
      </div>

      <GuideWalkthroughModal
        accent="apple"
        guideTitle="Apple Music on Android"
        open={walkthroughOpen}
        onClose={() => setWalkthroughOpen(false)}
        sections={APPLE_SECTIONS}
        initialStepId={initialStepId}
        renderPreview={(preview) => <ApplePreview kind={preview} />}
      />
    </>
  )
}
