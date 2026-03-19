import { PageHero } from "@/components/shared/page-hero"
import { SignUpForm } from "@/components/auth/sign-up-form"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Sparkles, MapPin, Music4, Trophy } from "lucide-react"

export default function SignUpPage() {
  const steps = [
    { icon: Sparkles, title: "Choose a username", desc: "Your identity on leaderboards and project pages" },
    { icon: MapPin, title: "Confirm your state", desc: "State is required for scoring. City is optional." },
    { icon: Music4, title: "Connect tracker", desc: "Link Last.fm, stats.fm, or Musicat to verify your streams" },
    { icon: Trophy, title: "Join the race", desc: "Compete on individual and state leaderboards" }
  ]

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_1fr] lg:items-start">
      <div className="space-y-8">
        <PageHero
          eyebrow="Join the ARMY"
          title="Start your journey today"
          description="Create your account, lock in your state for scoring, and optionally add a city or town for the India activity map."
        />
        
        <div className="grid gap-3 sm:grid-cols-2">
          {steps.map((step, index) => (
            <Card key={step.title} className="border-white/80 bg-white/60 transition-colors hover:border-[hsl(265,60%,55%)]/30">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-gradient-to-br from-[hsl(265,60%,55%)]/10 to-[hsl(30,100%,50%)]/10 flex items-center justify-center">
                    <step.icon className="w-4 h-4 text-[hsl(265,60%,55%)]" />
                  </div>
                  <div>
                    <p className="text-xs font-medium text-slate-800">{index + 1}. {step.title}</p>
                    <p className="mt-0.5 text-xs text-slate-600">{step.desc}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
      
      <Card className="bg-white/90 backdrop-blur-sm">
        <CardHeader className="text-center">
          <div className="mx-auto w-14 h-14 rounded-2xl bg-gradient-to-br from-[hsl(265,60%,55%)] to-[hsl(30,100%,50%)] flex items-center justify-center mb-4">
            <Sparkles className="w-7 h-7 text-white" />
          </div>
          <CardTitle className="text-2xl text-slate-900">Create your account</CardTitle>
          <p className="mt-2 text-sm text-slate-600">State is mandatory. City can wait.</p>
        </CardHeader>
        <CardContent>
          <SignUpForm />
        </CardContent>
      </Card>
    </div>
  )
}
