import { PageHero } from "@/components/shared/page-hero"
import { SignInForm } from "@/components/auth/sign-in-form"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Heart, Music4, Users } from "lucide-react"

export default function SignInPage() {
  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_1fr] lg:items-start">
      <div className="space-y-8">
        <PageHero
          eyebrow="Sign in"
          title="Welcome back, ARMY!"
          description="Pick up where you left off — track your missions, check your individual and state rank, and see the latest chart movements."
        />
        
        <div className="space-y-4">
          <Card className="bg-gradient-to-br from-[hsl(265,60%,55%)]/5 to-[hsl(30,100%,50%)]/5 border-[hsl(265,60%,55%)]/10">
            <CardContent className="p-5">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-[hsl(265,60%,55%)]/10 flex items-center justify-center">
                  <Music4 className="w-5 h-5 text-[hsl(265,60%,55%)]" />
                </div>
                <div>
                  <CardTitle className="text-base">Track Your Progress</CardTitle>
                  <p className="mt-1 text-sm text-muted-foreground">Follow your missions, refresh tracker progress, and monitor your individual and state ranks in real time.</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-br from-[hsl(30,100%,50%)]/5 to-[hsl(170,60%,40%)]/5 border-[hsl(30,100%,50%)]/10">
            <CardContent className="p-5">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-[hsl(30,100%,50%)]/10 flex items-center justify-center">
                  <Users className="w-5 h-5 text-[hsl(30,100%,50%)]" />
                </div>
                <div>
                  <CardTitle className="text-base">Join the Community</CardTitle>
                  <p className="mt-1 text-sm text-muted-foreground">Connect with Indian ARMY, participate in campaigns, and make your streams count.</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      
      <Card className="bg-white/90 backdrop-blur-sm">
        <CardHeader className="text-center">
          <div className="mx-auto w-14 h-14 rounded-2xl bg-gradient-to-br from-[hsl(265,60%,55%)] to-[hsl(30,100%,50%)] flex items-center justify-center mb-4">
            <Heart className="w-7 h-7 text-white fill-white" />
          </div>
          <CardTitle className="text-2xl">Welcome back</CardTitle>
          <p className="text-sm text-muted-foreground mt-2">Sign in to continue your ARMY journey</p>
        </CardHeader>
        <CardContent>
          <SignInForm />
        </CardContent>
      </Card>
    </div>
  )
}
