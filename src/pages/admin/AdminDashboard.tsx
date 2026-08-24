export default function AdminDashboard() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground mt-2">
          Welcome to the Jami Mode Admin Dashboard.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {/* Placeholder cards for future dashboard stats */}
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="rounded-xl border bg-card text-card-foreground shadow-sm p-6">
             <div className="flex flex-row items-center justify-between space-y-0 pb-2">
                <h3 className="tracking-tight text-sm font-medium">Stat {i}</h3>
             </div>
             <div className="text-2xl font-bold">---</div>
          </div>
        ))}
      </div>
    </div>
  );
}
