export default function CoursesPage() {
  return (
    <div className="px-4 sm:px-6 pt-6 max-w-6xl mx-auto min-h-[60vh] flex items-center justify-center">
      <div className="text-center">
        <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6"
          style={{ background: 'rgba(0,245,255,0.06)', border: '1px solid rgba(0,245,255,0.15)' }}>
          <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="#00F5FF" strokeWidth="1.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M4.26 10.147a60.436 60.436 0 00-.491 6.347A48.627 48.627 0 0112 20.904a48.627 48.627 0 018.232-4.41 60.46 60.46 0 00-.491-6.347m-15.482 0a50.57 50.57 0 00-2.658-.813A59.905 59.905 0 0112 3.493a59.902 59.902 0 0110.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.697 50.697 0 0112 13.489a50.702 50.702 0 017.74-3.342M6.75 15a.75.75 0 100-1.5.75.75 0 000 1.5zm0 0v-3.675A55.378 55.378 0 0112 8.443m-7.007 11.55A5.981 5.981 0 006.75 15.75v-1.5" />
          </svg>
        </div>
        <h1 className="text-xl font-medium text-white uppercase tracking-widest mb-2">Mis Cursos</h1>
        <div className="h-px w-20 mx-auto my-3 rounded-full"
          style={{ background: 'linear-gradient(90deg, transparent, #00F5FF, #FF2DF7, transparent)' }} />
        <p className="text-xs font-light tracking-[0.4em] uppercase" style={{ color: 'rgba(255,255,255,0.25)' }}>Próximamente</p>
      </div>
    </div>
  )
}
