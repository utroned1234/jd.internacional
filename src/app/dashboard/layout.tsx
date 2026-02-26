import Navbar from '@/components/Navbar'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen relative overflow-hidden bg-transparent">
      {/* Orbes de energía animados */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {/* Orbe cian — superior izquierdo */}
        <div className="absolute -top-32 -left-32 w-[500px] h-[500px] rounded-full blur-[120px] opacity-20 animate-pulse"
          style={{ background: 'radial-gradient(circle, #00F5FF, transparent 70%)', animationDuration: '6s' }} />
        {/* Orbe magenta — superior derecho */}
        <div className="absolute -top-20 -right-20 w-[400px] h-[400px] rounded-full blur-[100px] opacity-15 animate-pulse"
          style={{ background: 'radial-gradient(circle, #FF2DF7, transparent 70%)', animationDuration: '8s', animationDelay: '2s' }} />
        {/* Orbe violeta — centro */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full blur-[150px] opacity-10 animate-pulse"
          style={{ background: 'radial-gradient(circle, #7B00FF, transparent 70%)', animationDuration: '10s', animationDelay: '1s' }} />
        {/* Orbe verde — inferior derecho */}
        <div className="absolute -bottom-20 -right-10 w-[350px] h-[350px] rounded-full blur-[90px] opacity-10 animate-pulse"
          style={{ background: 'radial-gradient(circle, #00FF88, transparent 70%)', animationDuration: '7s', animationDelay: '3s' }} />
        {/* Orbe azul — inferior izquierdo */}
        <div className="absolute -bottom-10 -left-10 w-[300px] h-[300px] rounded-full blur-[80px] opacity-12 animate-pulse"
          style={{ background: 'radial-gradient(circle, #0066FF, transparent 70%)', animationDuration: '9s', animationDelay: '0.5s' }} />
      </div>

      {/* Grid sutil */}
      <div className="absolute inset-0 opacity-[0.025] pointer-events-none"
        style={{
          backgroundImage: 'linear-gradient(rgba(0,245,255,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(255,45,247,0.2) 1px, transparent 1px)',
          backgroundSize: '60px 60px'
        }}
      />

      <Navbar />
      <main className="relative z-10 pb-24 lg:pb-8 lg:pl-60">
        {children}
      </main>
    </div>
  )
}
