// Dashboard page - authentication is handled by middleware
// The middleware verifies the JWT token in the cookie before allowing access
export default async function Dashboard() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Welcome to Dashboard!</h1>
      <p className="text-muted-foreground">
        You are successfully authenticated. The middleware has verified your JWT token.
      </p>
    </div>
  )
}