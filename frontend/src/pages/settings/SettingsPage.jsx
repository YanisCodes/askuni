import { useState } from 'react'
import { User, Camera, SlidersHorizontal, Check, Loader2 } from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import usePreferences from '../../hooks/usePreferences'
import CameraLab from '../camera/CameraSettings'

const TABS = [
  { id: 'profile', label: 'Profile', icon: User },
  { id: 'preferences', label: 'Preferences', icon: SlidersHorizontal },
  { id: 'camera', label: 'Camera Lab', icon: Camera },
]

function Toggle({ checked, onChange }) {
  return (
    <button
      type="button"
      onClick={onChange}
      className={`relative w-11 h-6 rounded-full transition-colors duration-200 cursor-pointer shrink-0 ${
        checked ? 'bg-emerald-500' : 'bg-slate-200'
      }`}
    >
      <span
        className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow-sm transition-transform duration-200 ${
          checked ? 'translate-x-5' : 'translate-x-0'
        }`}
      />
    </button>
  )
}

function PrefRow({ label, desc, checked, onChange }) {
  return (
    <div className="flex items-center justify-between gap-6 py-3 border-b border-slate-100 last:border-0">
      <div className="min-w-0">
        <p className="text-sm font-medium text-slate-700">{label}</p>
        <p className="text-xs text-slate-400 mt-0.5">{desc}</p>
      </div>
      <Toggle checked={checked} onChange={onChange} />
    </div>
  )
}

export default function SettingsPage() {
  const { user, updateUser } = useAuth()
  const { prefs, togglePref } = usePreferences()

  const [tab, setTab] = useState('profile')
  const [name, setName] = useState(user?.name || '')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState('')

  const handleSaveProfile = async (e) => {
    e.preventDefault()
    const trimmed = name.trim()
    if (!trimmed || trimmed === user?.name) return
    setSaving(true)
    setError('')
    try {
      await updateUser({ name: trimmed })
      setSaved(true)
      setTimeout(() => setSaved(false), 2500)
    } catch {
      setError('Failed to save. Try again.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="animate-fade-in-up max-w-2xl">
      <h1 className="text-2xl font-bold text-slate-800 mb-6">Settings</h1>

      {/* Tab bar */}
      <div className="flex gap-1 p-1 glass rounded-xl w-fit mb-8">
        {TABS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setTab(id)}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 cursor-pointer ${
              tab === id
                ? 'bg-white shadow-sm text-slate-800'
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            <Icon size={15} />
            {label}
          </button>
        ))}
      </div>

      {/* Profile */}
      {tab === 'profile' && (
        <div className="space-y-4 animate-fade-in">
          <div className="glass-strong rounded-2xl p-6">
            <div className="flex items-center gap-4 mb-6 pb-6 border-b border-slate-100">
              <div className="w-14 h-14 rounded-2xl bg-slate-800 text-white flex items-center justify-center text-xl font-bold shrink-0">
                {user?.name?.charAt(0).toUpperCase() ?? '?'}
              </div>
              <div className="min-w-0">
                <p className="font-semibold text-slate-800 truncate">{user?.name}</p>
                <p className="text-sm text-slate-400 truncate">{user?.email}</p>
                {user?.isAdmin && (
                  <span className="inline-block mt-1 text-xs font-medium text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                    Admin
                  </span>
                )}
              </div>
            </div>

            <form onSubmit={handleSaveProfile} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
                  Display name
                </label>
                <input
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="input-glass w-full"
                  placeholder="Your name"
                  maxLength={80}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
                  Email
                </label>
                <input
                  value={user?.email ?? ''}
                  disabled
                  className="input-glass w-full opacity-50 cursor-not-allowed select-none"
                />
                <p className="text-xs text-slate-400 mt-1">Email address cannot be changed.</p>
              </div>

              {error && <p className="text-xs text-rose-500">{error}</p>}

              <button
                type="submit"
                disabled={saving || !name.trim() || name.trim() === user?.name}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-800 text-white text-sm font-medium disabled:opacity-40 hover:bg-slate-700 transition-all cursor-pointer"
              >
                {saving && <Loader2 size={14} className="animate-spin" />}
                {saved && <Check size={14} />}
                {saved ? 'Saved!' : saving ? 'Saving…' : 'Save changes'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Preferences */}
      {tab === 'preferences' && (
        <div className="space-y-4 animate-fade-in">
          <div className="glass-strong rounded-2xl p-6">
            <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
              Live Session
            </h3>
            <p className="text-sm text-slate-400 mb-4">
              Choose what's active by default when you join a live session.
            </p>
            <PrefRow
              label="Camera on by default"
              desc="Your camera will turn on automatically when entering a live session."
              checked={prefs.defaultCamOn}
              onChange={() => togglePref('defaultCamOn')}
            />
            <PrefRow
              label="Microphone on by default"
              desc="Your microphone will be unmuted automatically when entering a live session."
              checked={prefs.defaultMicOn}
              onChange={() => togglePref('defaultMicOn')}
            />
          </div>

          <p className="text-xs text-slate-400 px-1">
            Preferences are saved on this device only.
          </p>
        </div>
      )}

      {/* Camera Lab */}
      {tab === 'camera' && (
        <div className="animate-fade-in">
          <CameraLab />
        </div>
      )}
    </div>
  )
}
