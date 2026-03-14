import type { NextPageContext } from "next"

type ErrorProps = {
  statusCode?: number
}

function ErrorPage({ statusCode }: ErrorProps) {
  return (
    <main className="container py-20">
      <h1 className="font-[family-name:var(--font-heading)] text-4xl font-semibold">
        {statusCode ? `Error ${statusCode}` : "Something went wrong"}
      </h1>
      <p className="mt-3 text-muted-foreground">
        The project scaffold is running, but this request could not be completed.
      </p>
    </main>
  )
}

ErrorPage.getInitialProps = ({ res, err }: NextPageContext) => {
  const statusCode = res?.statusCode ?? err?.statusCode ?? 500
  return { statusCode }
}

export default ErrorPage
