
import { useState } from 'react'
import {
  BrowserRouter, Routes, Route, Link, NavLink,
  useNavigate, useParams, Navigate
} from 'react-router-dom'
import {
  Heart, Home, Compass, Activity, User, Menu, Play,
  Clock, Flame, Droplets, Moon, ArrowRight, ArrowLeft,
  CheckCircle, Leaf, Dumbbell, BookOpen, ChevronRight,
  LogOut, Plus, X
} from 'lucide-react'
import './App.css'

const workouts = [
  {
    id: 1,
    title: 'Morning Yoga',
    category: 'Yoga',
    duration: '15 menit',
    level: 'Pemula',
    image: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=800',
    description: 'Mulai hari dengan gerakan yoga ringan untuk membantu tubuh lebih rileks dan segar.'
  },
  {
    id: 2,
    title: 'Pilates for Beginners',
    category: 'Pilates',
    duration: '20 menit',
    level: 'Pemula',
    image: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?w=800',
    description: 'Latihan pilates sederhana untuk melatih kekuatan otot inti dan postur tubuh.'
  },
  {
    id: 3,
    title: 'Daily Stretching',
    category: 'Stretching',
    duration: '10 menit',
    level: 'Semua level',
    image: 'https://images.unsplash.com/photo-1562088287-bde35a1ea917?w=800',
    description: 'Peregangan ringan untuk mengurangi ketegangan setelah beraktivitas.'
  },
]

const articles = [
  {
    id: 1,
    title: 'Pentingnya Menjaga Pola Tidur',
    category: 'Kesehatan',
    read: '4 menit',
    image: 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=800',
    description: 'Tidur yang cukup membantu tubuh memulihkan energi, menjaga konsentrasi, dan mendukung kesehatan secara keseluruhan.'
  },
  {
    id: 2,
    title: 'Mengenal Nutrisi Seimbang',
    category: 'Nutrisi',
    read: '5 menit',
    image: 'https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=800',
    description: 'Pola makan seimbang membantu memenuhi kebutuhan nutrisi tubuh melalui karbohidrat, protein, lemak, vitamin, dan mineral.'
  },
  {
    id: 3,
    title: 'Manfaat Minum Air Putih',
    category: 'Kebiasaan Sehat',
    read: '3 menit',
    image: 'https://images.unsplash.com/photo-1548839140-29a749e1cf4d?w=800',
    description: 'Menjaga asupan air membantu tubuh mengatur suhu, mendukung pencernaan, dan menjaga fungsi organ.'
  },
]

function getSaved(key, fallback) {
  try {
    return JSON.parse(localStorage.getItem(key)) || fallback
  } catch {
    return fallback
  }
}

function Layout({ children }) {
  const [menuOpen, setMenuOpen] = useState(false)

  const links = [
    { to: '/', label: 'Beranda', icon: Home },
    { to: '/jelajahi', label: 'Jelajahi', icon: Compass },
    { to: '/artikel', label: 'Artikel', icon: BookOpen },
    { to: '/aktivitas', label: 'Aktivitas', icon: Activity },
    { to: '/favorit', label: 'Favorit', icon: Heart },
    { to: '/profil', label: 'Profil', icon: User },
  ]

  return (
    <div className="app-shell">
      <header className="topbar">
        <Link to="/" className="brand">
          <span className="brand-icon"><Leaf size={21} /></span>
          <span>Moodaily</span>
        </Link>

        <button className="menu-toggle" onClick={() => setMenuOpen(!menuOpen)}>
          {menuOpen ? <X /> : <Menu />}
        </button>

        <nav className={`desktop-nav ${menuOpen ? 'show-menu' : ''}`}>
          {links.map(item => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/'}
              onClick={() => setMenuOpen(false)}
            >
              {item.label}
            </NavLink>
          ))}
          <Link to="/masuk" className="nav-login">Masuk</Link>
        </nav>
      </header>

      <main className="main-content">{children}</main>

      <nav className="mobile-nav">
        {links.filter(item => item.to !== '/artikel').map(item => {
          const Icon = item.icon
          return (
            <NavLink key={item.to} to={item.to} end={item.to === '/'}>
              <Icon size={20} />
              <span>{item.label}</span>
            </NavLink>
          )
        })}
      </nav>

      <footer className="footer">
        <Link to="/" className="footer-brand">Moodaily</Link>
        <p>Your Daily Dose of Wellness</p>
        <span>© 2026 Moodaily. Made for healthier days.</span>
      </footer>
    </div>
  )
}

function SectionTitle({ eyebrow, title, link, to = '/jelajahi' }) {
  return (
    <div className="section-heading">
      <div>
        {eyebrow && <span className="eyebrow">{eyebrow}</span>}
        <h2>{title}</h2>
      </div>
      {link && <Link to={to} className="text-link">{link} <ArrowRight size={15} /></Link>}
    </div>
  )
}

function WorkoutCard({ item, favoriteIds, toggleFavorite }) {
  const saved = favoriteIds.includes(item.id)

  return (
    <article className="content-card">
      <div className="card-image">
        <img src={item.image} alt={item.title} />
        <button
          className={`favorite-button ${saved ? 'active' : ''}`}
          onClick={() => toggleFavorite(item.id)}
          aria-label="Simpan favorit"
        >
          <Heart size={18} fill={saved ? 'currentColor' : 'none'} />
        </button>
        <span className="image-label">{item.category}</span>
      </div>
      <div className="card-body">
        <h3>{item.title}</h3>
        <div className="card-meta">
          <span><Clock size={14} /> {item.duration}</span>
          <span>{item.level}</span>
        </div>
        <Link to={`/video/${item.id}`} className="card-link">
          Lihat latihan <ArrowRight size={15} />
        </Link>
      </div>
    </article>
  )
}

function ArticleCard({ item }) {
  return (
    <article className="article-card">
      <img src={item.image} alt={item.title} />
      <div>
        <span className="eyebrow">{item.category} · {item.read}</span>
        <h3>{item.title}</h3>
        <Link to={`/artikel/${item.id}`} className="card-link">
          Baca selengkapnya <ArrowRight size={15} />
        </Link>
      </div>
    </article>
  )
}

function HomePage() {
  const [favorites, setFavorites] = useState(getSaved('moodaily-favorites', []))

  function toggleFavorite(id) {
    const updated = favorites.includes(id)
      ? favorites.filter(item => item !== id)
      : [...favorites, id]

    setFavorites(updated)
    localStorage.setItem('moodaily-favorites', JSON.stringify(updated))
  }

  return (
    <>
      <section className="welcome-row">
        <div>
          <span className="eyebrow">YOUR DAILY DOSE OF WELLNESS</span>
          <h1>Hai, selamat datang di <span>Moodaily.</span></h1>
          <p>Mulai dari langkah kecil untuk hari yang lebih sehat dan seimbang.</p>
          <Link to="/jelajahi" className="primary-button">
            Mulai eksplorasi <ArrowRight size={17} />
          </Link>
        </div>
        <div className="welcome-art">
          <img src="https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=900" alt="Yoga dan wellness" />
          <div className="art-note"><Leaf size={17} /> Take it one day at a time</div>
        </div>
      </section>

      <section className="daily-stats">
        <div><span className="stat-icon peach"><Flame /></span><div><strong>30 menit</strong><small>Target aktivitas</small></div></div>
        <div><span className="stat-icon green"><Droplets /></span><div><strong>8 gelas</strong><small>Target air putih</small></div></div>
        <div><span className="stat-icon beige"><Moon /></span><div><strong>7–9 jam</strong><small>Target tidur</small></div></div>
      </section>

      <section className="page-section">
        <SectionTitle eyebrow="MOVE YOUR BODY" title="Temukan latihan untukmu" link="Lihat semua" />
        <div className="workout-grid">
          {workouts.map(item => (
            <WorkoutCard key={item.id} item={item} favoriteIds={favorites} toggleFavorite={toggleFavorite} />
          ))}
        </div>
      </section>

      <section className="quote-banner">
        <Leaf size={25} />
        <div>
          <h2>Progress kecil tetaplah progress.</h2>
          <p>Jangan terburu-buru. Nikmati setiap proses menuju hidup yang lebih sehat.</p>
        </div>
      </section>

      <section className="page-section">
        <SectionTitle eyebrow="READ AND LEARN" title="Wawasan sehat hari ini" link="Baca artikel" to="/artikel" />
        <div className="article-grid">
          {articles.slice(0, 2).map(item => <ArticleCard key={item.id} item={item} />)}
        </div>
      </section>
    </>
  )
}

function ExplorePage() {
  const [category, setCategory] = useState('Semua')
  const [favorites, setFavorites] = useState(getSaved('moodaily-favorites', []))
  const categories = ['Semua', 'Yoga', 'Pilates', 'Stretching']
  const filtered = category === 'Semua' ? workouts : workouts.filter(w => w.category === category)

  function toggleFavorite(id) {
    const updated = favorites.includes(id) ? favorites.filter(x => x !== id) : [...favorites, id]
    setFavorites(updated)
    localStorage.setItem('moodaily-favorites', JSON.stringify(updated))
  }

  return (
    <section className="page-section">
      <span className="eyebrow">EXPLORE YOUR WELLNESS</span>
      <h1 className="page-title">Jelajahi aktivitas</h1>
      <p className="page-description">Pilih latihan ringan yang sesuai dengan kebutuhan dan waktumu.</p>
      <div className="filter-row">
        {categories.map(item => (
          <button key={item} className={category === item ? 'filter-chip selected' : 'filter-chip'} onClick={() => setCategory(item)}>{item}</button>
        ))}
      </div>
      <div className="workout-grid">
        {filtered.map(item => <WorkoutCard key={item.id} item={item} favoriteIds={favorites} toggleFavorite={toggleFavorite} />)}
      </div>
    </section>
  )
}

function VideoDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const item = workouts.find(w => w.id === Number(id))
  const [done, setDone] = useState(false)
  const [favorites, setFavorites] = useState(getSaved('moodaily-favorites', []))

  if (!item) return <div className="empty-state">Latihan tidak ditemukan.</div>

  function toggleFavorite() {
    const updated = favorites.includes(item.id) ? favorites.filter(x => x !== item.id) : [...favorites, item.id]
    setFavorites(updated)
    localStorage.setItem('moodaily-favorites', JSON.stringify(updated))
  }

  function completeWorkout() {
    const history = getSaved('moodaily-activity', [])
    history.unshift({
      title: item.title,
      duration: item.duration,
      date: new Date().toLocaleDateString('id-ID')
    })
    localStorage.setItem('moodaily-activity', JSON.stringify(history))
    setDone(true)
  }

  return (
    <section className="detail-layout">
      <button className="back-button" onClick={() => navigate('/jelajahi')}>
        <ArrowLeft size={17} /> Kembali ke Jelajahi
      </button>
      <div className="detail-image">
        <img src={item.image} alt={item.title} />
        <span className="play-overlay"><Play fill="currentColor" /></span>
      </div>
      <div className="detail-info">
        <span className="eyebrow">{item.category} · {item.level}</span>
        <h1>{item.title}</h1>
        <p>{item.description}</p>
        <div className="detail-meta">
          <span><Clock /> {item.duration}</span>
          <span><Dumbbell /> {item.level}</span>
        </div>
        <div className="detail-note">
          <strong>Panduan latihan</strong>
          <p>Siapkan ruang yang nyaman, gunakan pakaian yang leluasa, dan lakukan gerakan sesuai kemampuan tubuh. Jangan memaksakan diri jika merasa tidak nyaman.</p>
        </div>
        <div className="detail-actions">
          <button className="primary-button" onClick={completeWorkout}>
            {done ? <><CheckCircle size={17} /> Selesai dicatat</> : <>Tandai latihan selesai <CheckCircle size={17} /></>}
          </button>
          <button className="outline-button" onClick={toggleFavorite}>
            <Heart size={17} fill={favorites.includes(item.id) ? 'currentColor' : 'none'} />
            {favorites.includes(item.id) ? 'Tersimpan' : 'Simpan favorit'}
          </button>
        </div>
      </div>
    </section>
  )
}

function ArticlesPage() {
  return (
    <section className="page-section">
      <span className="eyebrow">HEALTHY KNOWLEDGE</span>
      <h1 className="page-title">Artikel & Nutrisi</h1>
      <p className="page-description">Informasi sederhana untuk mendukung pilihan hidup yang lebih sehat.</p>
      <div className="article-grid article-grid-large">
        {articles.map(item => <ArticleCard key={item.id} item={item} />)}
      </div>
      <div className="nutrition-box">
        <Leaf size={25} />
        <div>
          <h2>Ingat prinsip gizi seimbang</h2>
          <p>Konsumsi makanan beragam, cukupi kebutuhan air, dan sesuaikan porsi dengan kebutuhan tubuh.</p>
        </div>
      </div>
    </section>
  )
}

function ArticleDetailPage() {
  const { id } = useParams()
  const item = articles.find(a => a.id === Number(id))

  if (!item) return <div className="empty-state">Artikel tidak ditemukan.</div>

  return (
    <section className="article-detail">
      <Link to="/artikel" className="back-button"><ArrowLeft size={17} /> Kembali ke artikel</Link>
      <img src={item.image} alt={item.title} />
      <span className="eyebrow">{item.category} · {item.read}</span>
      <h1>{item.title}</h1>
      <p>{item.description}</p>
      <p>Menerapkan kebiasaan sehat tidak harus dilakukan sekaligus. Mulailah dengan perubahan sederhana dan lakukan secara konsisten sesuai kondisi masing-masing.</p>
      <p>Informasi ini bersifat edukatif dan bukan pengganti saran dari tenaga kesehatan profesional.</p>
    </section>
  )
}

function ActivityPage() {
  const [history, setHistory] = useState(getSaved('moodaily-activity', []))
  const [activity, setActivity] = useState('Yoga')
  const [duration, setDuration] = useState('15')

  function addActivity(e) {
    e.preventDefault()
    const updated = [
      { title: activity, duration: `${duration} menit`, date: new Date().toLocaleDateString('id-ID') },
      ...history
    ]
    setHistory(updated)
    localStorage.setItem('moodaily-activity', JSON.stringify(updated))
  }

  return (
    <section className="page-section narrow-section">
      <span className="eyebrow">YOUR DAILY PROGRESS</span>
      <h1 className="page-title">Aktivitas saya</h1>
      <p className="page-description">Catat kegiatan sehatmu dan lihat perkembangan dari waktu ke waktu.</p>
      <form className="activity-form" onSubmit={addActivity}>
        <h2>Catat aktivitas baru</h2>
        <label>Jenis aktivitas</label>
        <select value={activity} onChange={e => setActivity(e.target.value)}>
          <option>Yoga</option>
          <option>Pilates</option>
          <option>Stretching</option>
          <option>Jalan kaki</option>
          <option>Lari</option>
          <option>Lainnya</option>
        </select>
        <label>Durasi (menit)</label>
        <input type="number" min="1" max="300" value={duration} onChange={e => setDuration(e.target.value)} required />
        <button className="primary-button" type="submit"><Plus size={17} /> Simpan aktivitas</button>
      </form>
      <div className="history-list">
        <h2>Riwayat aktivitas</h2>
        {history.length === 0
          ? <div className="empty-state">Belum ada aktivitas. Yuk, mulai catat kegiatan sehatmu!</div>
          : history.map((item, index) => (
            <div className="history-item" key={index}>
              <span className="history-icon"><Activity /></span>
              <div><strong>{item.title}</strong><small>{item.date}</small></div>
              <span className="history-duration">{item.duration}</span>
            </div>
          ))}
      </div>
    </section>
  )
}

function FavoritesPage() {
  const [favorites, setFavorites] = useState(getSaved('moodaily-favorites', []))
  const savedWorkouts = workouts.filter(item => favorites.includes(item.id))

  function removeFavorite(id) {
    const updated = favorites.filter(x => x !== id)
    setFavorites(updated)
    localStorage.setItem('moodaily-favorites', JSON.stringify(updated))
  }

  return (
    <section className="page-section">
      <span className="eyebrow">YOUR COLLECTION</span>
      <h1 className="page-title">Konten favorit</h1>
      <p className="page-description">Kumpulan latihan dan bacaan yang kamu simpan.</p>
      {savedWorkouts.length === 0 ? (
        <div className="empty-state">
          <Heart size={30} />
          <h3>Belum ada konten tersimpan</h3>
          <p>Simpan latihan yang ingin kamu lihat kembali.</p>
          <Link to="/jelajahi" className="primary-button">Jelajahi konten</Link>
        </div>
      ) : (
        <div className="workout-grid">
          {savedWorkouts.map(item => (
            <WorkoutCard key={item.id} item={item} favoriteIds={favorites} toggleFavorite={removeFavorite} />
          ))}
        </div>
      )}
    </section>
  )
}

function ProfilePage() {
  const navigate = useNavigate()
  const user = getSaved('moodaily-user', {
    name: 'Pengguna Moodaily',
    email: 'user@moodaily.com'
  })

  function logout() {
    localStorage.removeItem('moodaily-user')
    localStorage.removeItem('moodaily-token')
    navigate('/masuk')
  }

  return (
    <section className="page-section narrow-section">
      <span className="eyebrow">YOUR PERSONAL SPACE</span>
      <h1 className="page-title">Profil saya</h1>
      <div className="profile-card">
        <div className="avatar"><User size={35} /></div>
        <h2>{user.name}</h2>
        <p>{user.email}</p>
        <span className="profile-tag">Moodaily member · {user.userId || ''}</span>
      </div>
      <div className="profile-menu">
        <Link to="/aktivitas"><Activity /> Riwayat aktivitas <ChevronRight /></Link>
        <Link to="/favorit"><Heart /> Konten favorit <ChevronRight /></Link>
        <button onClick={logout}><LogOut /> Keluar dari akun <ChevronRight /></button>
      </div>
    </section>
  )
}

// AUTH: REGISTER DAN LOGIN TERHUBUNG KE BACKEND
function AuthPage({ register = false }) {
  const navigate = useNavigate()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function submit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      if (register) {
        const registerResponse = await fetch(
          'http://localhost:5000/api/auth/register',
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, email, password })
          }
        )

        const registerResult = await registerResponse.json()

        if (!registerResponse.ok) {
          throw new Error(registerResult.message || 'Registrasi gagal.')
        }
      }

      const loginResponse = await fetch(
        'http://localhost:5000/api/auth/login',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password })
        }
      )

      const loginResult = await loginResponse.json()

      if (!loginResponse.ok) {
        throw new Error(loginResult.message || 'Login gagal.')
      }

      localStorage.setItem('moodaily-token', loginResult.token)
      localStorage.setItem('moodaily-user', JSON.stringify(loginResult.user))

      navigate('/')
    } catch (err) {
      setError(err.message || 'Tidak dapat terhubung ke server.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-visual">
        <Leaf size={35} />
        <h2>Your Daily Dose of Wellness</h2>
        <p>Rawat diri, nikmati proses, dan tumbuh menjadi versi terbaik dirimu.</p>
      </div>

      <form className="auth-form" onSubmit={submit}>
        <Link to="/" className="back-button"><ArrowLeft size={17} /> Kembali</Link>
        <span className="eyebrow">{register ? 'JOIN MOODAILY' : 'WELCOME BACK'}</span>
        <h1>{register ? 'Buat akun baru' : 'Selamat datang kembali'}</h1>
        <p>{register ? 'Mulai perjalanan hidup sehatmu bersama Moodaily.' : 'Masuk untuk melanjutkan perjalanan sehatmu.'}</p>

        {register && (
          <>
            <label>Nama lengkap</label>
            <input
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="Nama kamu"
              required
            />
          </>
        )}

        <label>Email</label>
        <input
          type="email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          placeholder="nama@email.com"
          required
        />

        <label>Password</label>
        <input
          type="password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          placeholder="Masukkan password"
          required
          minLength="6"
        />

        {error && (
          <p style={{ color: '#c65b52', marginTop: '10px' }}>
            {error}
          </p>
        )}

        <button type="submit" className="primary-button" disabled={loading}>
          {loading
            ? 'Memproses...'
            : register
              ? 'Daftar sekarang'
              : 'Masuk'}
          {!loading && <ArrowRight size={17} />}
        </button>

        <div className="auth-switch">
          {register ? 'Sudah punya akun?' : 'Belum punya akun?'}
          {' '}
          <Link to={register ? '/masuk' : '/daftar'}>
            {register ? 'Masuk' : 'Daftar'}
          </Link>
        </div>
      </form>
    </div>
  )
}

function AppContent() {
  return (
    <Routes>
      <Route path="/daftar" element={<AuthPage register />} />
      <Route path="/masuk" element={<AuthPage />} />
      <Route path="/" element={<Layout><HomePage /></Layout>} />
      <Route path="/jelajahi" element={<Layout><ExplorePage /></Layout>} />
      <Route path="/video/:id" element={<Layout><VideoDetailPage /></Layout>} />
      <Route path="/artikel" element={<Layout><ArticlesPage /></Layout>} />
      <Route path="/artikel/:id" element={<Layout><ArticleDetailPage /></Layout>} />
      <Route path="/aktivitas" element={<Layout><ActivityPage /></Layout>} />
      <Route path="/favorit" element={<Layout><FavoritesPage /></Layout>} />
      <Route path="/profil" element={<Layout><ProfilePage /></Layout>} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  )
}

export default App
