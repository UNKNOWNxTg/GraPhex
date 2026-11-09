import { useEffect, useMemo, useRef, useState, type ChangeEvent, type FormEvent, type ReactNode } from 'react'
import {
  ArrowLeft, Check, CheckCheck, ChevronRight, CircleHelp, FileText,
  Image, LockKeyhole, LogOut, MessageCircle, MoreHorizontal, Paperclip, Plus, Search,
  Send, Settings, Shield, Sun, Moon, Laptop, UserRound, Eye, EyeOff, X, Smile,
  SlidersHorizontal, Download, Trash2, type LucideIcon,
} from 'lucide-react'
import { initialConversations } from './data/mockConversations'
import { defaultPreferences, previewUser } from './data/mockUser'
import type { Conversation, Message, Theme } from './types/messaging'
type Route = 'messages' | 'settings' | 'auth'
type AuthMode = 'login' | 'signup' | 'forgot'
type SettingsTab = 'account' | 'appearance' | 'privacy' | 'general'
const settingsItems: { id: SettingsTab; label: string; icon: LucideIcon }[] = [
  { id: 'account', label: 'Account', icon: UserRound }, { id: 'appearance', label: 'Appearance', icon: Sun },
  { id: 'privacy', label: 'Privacy', icon: LockKeyhole }, { id: 'general', label: 'General', icon: SlidersHorizontal },
]
const emojiOptions = ['♡', '❤️', '😊', '😂', '✨', '👍', '🌙', '🙌']

function BrandMark({ compact = false }: { compact?: boolean }) {
  return <span className={`brand-lockup ${compact ? 'brand-compact' : ''}`} aria-label="GraPhex">
    <span className={`brand-image-crop ${compact ? 'brand-image-mark' : ''}`}><img src="/graphex-brand.png" alt="" /></span>
  </span>
}

function Avatar({ name, initials, color, size = 'md', online = false }: { name: string; initials: string; color: string; size?: 'sm' | 'md' | 'lg'; online?: boolean }) {
  return <span className={`avatar avatar-${color} avatar-${size}`} aria-label={name}>{initials}{online && <i className="online-dot" />}</span>
}

function App() {
  const [conversations, setConversations] = useState(initialConversations)
  const [activeId, setActiveId] = useState(1)
  const [route, setRoute] = useState<Route>('messages')
  const [authMode, setAuthMode] = useState<AuthMode>('login')
  const [settingsTab, setSettingsTab] = useState<SettingsTab>('account')
  const [mobileChatOpen, setMobileChatOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [filterUnread, setFilterUnread] = useState(false)
  const [draft, setDraft] = useState('')
  const [theme, setTheme] = useState<Theme>(() => (localStorage.getItem('graphex-theme') as Theme | null) ?? defaultPreferences.theme)
  const [notice, setNotice] = useState('')
  const [profileOpen, setProfileOpen] = useState(false)
  const [profileDialog, setProfileDialog] = useState(false)
  const [showNewMessage, setShowNewMessage] = useState(false)
  const [recipient, setRecipient] = useState('')
  const [emojiOpen, setEmojiOpen] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [authError, setAuthError] = useState('')
  const [authNotice, setAuthNotice] = useState('')
  const [appearance, setAppearance] = useState<Theme>(theme)
  const [privatePresence, setPrivatePresence] = useState(!defaultPreferences.presenceVisible)
  const [readReceipts, setReadReceipts] = useState(defaultPreferences.readReceipts)
  const [compactDensity, setCompactDensity] = useState(defaultPreferences.compactSpacing)
  const [confirmReset, setConfirmReset] = useState(false)
  const [displayName, setDisplayName] = useState(previewUser.displayName)
  const [profileDraft, setProfileDraft] = useState(previewUser.displayName)
  const endRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const imageInputRef = useRef<HTMLInputElement>(null)

  const active = conversations.find((item) => item.id === activeId) ?? conversations[0]!
  const visibleConversations = useMemo(() => conversations.filter((item) => {
    const matches = `${item.name} ${item.preview}`.toLowerCase().includes(query.trim().toLowerCase())
    return matches && (!filterUnread || Boolean(item.unread))
  }), [conversations, query, filterUnread])

  useEffect(() => {
    const applyTheme = (value: Theme) => {
      const systemLight = window.matchMedia('(prefers-color-scheme: light)').matches
      document.documentElement.dataset.theme = value === 'system' ? (systemLight ? 'light' : 'dark') : value
    }
    applyTheme(theme)
    localStorage.setItem('graphex-theme', theme)
    const media = window.matchMedia('(prefers-color-scheme: light)')
    const updateSystemTheme = () => { if (theme === 'system') applyTheme(theme) }
    media.addEventListener('change', updateSystemTheme)
    return () => media.removeEventListener('change', updateSystemTheme)
  }, [theme])
  useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' }) }, [active.messages.length, activeId])
  useEffect(() => { if (!notice) return; const timer = window.setTimeout(() => setNotice(''), 2600); return () => window.clearTimeout(timer) }, [notice])

  function showNotice(text: string) { setNotice(text) }
  function openRoute(next: Route) {
    setRoute(next); setProfileOpen(false)
    if (next === 'messages') setMobileChatOpen(false)
  }
  function openConversation(id: number) {
    setActiveId(id); setMobileChatOpen(true); setRoute('messages')
    setConversations((items) => items.map((item) => item.id === id ? { ...item, unread: undefined } : item))
  }
  function addMessage(text: string, attachment = false) {
    const cleanText = text.trim()
    if (!cleanText) return
    const time = new Intl.DateTimeFormat('en', { hour: 'numeric', minute: '2-digit' }).format(new Date())
    setConversations((items) => items.map((item) => item.id === activeId ? {
      ...item, preview: attachment ? `📎 ${cleanText}` : `You: ${cleanText}`, time: 'now',
      messages: [...item.messages, { id: Date.now(), text: cleanText, time, mine: true, read: false, attachment }],
    } : item))
  }
  function sendMessage(event?: FormEvent) {
    event?.preventDefault()
    if (!draft.trim()) return
    addMessage(draft)
    setDraft(''); setEmojiOpen(false)
  }
  function handleFileChange(event: ChangeEvent<HTMLInputElement>, image = false) {
    const file = event.currentTarget.files?.[0]
    if (!file) return
    addMessage(`${image ? 'Image' : 'File'} · ${file.name}`, true)
    showNotice(`${file.name} added to this local preview`)
    event.currentTarget.value = ''
  }
  function startConversation(event: FormEvent) {
    event.preventDefault()
    const name = recipient.trim()
    if (!name) return
    const initials = name.split(/[\s@._-]+/).filter(Boolean).slice(0, 2).map((part) => part[0]!.toUpperCase()).join('') || 'GP'
    const id = Date.now()
    setConversations((items) => [{ id, name, initials, color: 'ivory', online: false, preview: 'Start your conversation', time: 'now', messages: [] }, ...items])
    setActiveId(id); setRoute('messages'); setMobileChatOpen(true); setShowNewMessage(false); setRecipient('')
  }
  function submitAuth(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setAuthError(''); setAuthNotice('')
    const form = new FormData(event.currentTarget)
    const password = String(form.get('password') ?? '')
    if (authMode === 'signup' && password !== String(form.get('confirmPassword') ?? '')) {
      setAuthError('Those passwords don’t match. Try again.')
      return
    }
    if (authMode === 'forgot') {
      setAuthNotice('Password reset isn’t connected in this preview.')
      return
    }
    if (authMode === 'signup') {
      setAuthNotice('Sign up isn’t connected in this preview. Your details were not sent.')
      return
    }
    openRoute('messages')
    showNotice('Demo preview opened. No account session was created.')
    setMobileChatOpen(false)
  }
  function setSelectedTheme(value: Theme) { setTheme(value); setAppearance(value) }
  function resetPreview() {
    setConversations(initialConversations); setActiveId(1); setRoute('auth'); setAuthMode('login'); setMobileChatOpen(false); setConfirmReset(false)
    showNotice('Local preview was reset')
  }

  return <div className={`app-shell ${compactDensity ? 'compact-density' : ''} ${mobileChatOpen ? 'mobile-chat-open' : ''} ${route === 'settings' ? 'settings-mode' : ''} ${route === 'auth' ? 'auth-mode' : ''}`}>
    {route !== 'auth' && <>
      <aside className="left-nav" aria-label="Main navigation">
        <button className="brand-button" aria-label="GraPhex home" onClick={() => openRoute('messages')}><BrandMark /></button>
        <div className="primary-nav">
          <button className={`primary-nav-item ${route === 'messages' ? 'is-active' : ''}`} aria-current={route === 'messages' ? 'page' : undefined} onClick={() => openRoute('messages')}><MessageCircle size={18} /><span>Messages</span></button>
          <button className={`primary-nav-item ${route === 'settings' ? 'is-active' : ''}`} aria-current={route === 'settings' ? 'page' : undefined} onClick={() => openRoute('settings')}><Settings size={18} /><span>Settings</span></button>
        </div>
        <div className="nav-bottom">
          <button className="profile-launcher" aria-expanded={profileOpen} onClick={() => setProfileOpen(!profileOpen)}><Avatar name={displayName} initials="UJ" color="portrait" size="sm" /><span className="profile-label"><strong>{displayName}</strong><small>@{previewUser.username}</small></span><MoreHorizontal size={17} /></button>
        </div>
      </aside>

      {route === 'messages' && <aside className={`conversation-panel ${mobileChatOpen ? 'mobile-list-hidden' : ''}`} aria-label="Conversation list">
        <div className="conversation-header"><div><p className="section-kicker">YOUR SPACE</p><h1>Messages</h1></div><button className="icon-button new-conversation-button" aria-label="New message" onClick={() => setShowNewMessage(true)}><Plus size={18} /></button></div>
        <label className="search-box"><Search size={16} /><input aria-label="Search messages" placeholder="Search messages…" value={query} onChange={(event) => setQuery(event.target.value)} /><kbd>⌘ K</kbd></label>
        <div className="list-controls"><span>Recent</span><button className={filterUnread ? 'filter-selected' : ''} onClick={() => setFilterUnread(!filterUnread)} aria-pressed={filterUnread}>Unread{filterUnread && <span className="filter-dot" />}</button></div>
        <div className="conversation-list" role="list" aria-label="Messages">
          {visibleConversations.map((conversation) => <button key={conversation.id} role="listitem" className={`conversation-item ${activeId === conversation.id ? 'conversation-selected' : ''}`} onClick={() => openConversation(conversation.id)}>
            <Avatar name={conversation.name} initials={conversation.initials} color={conversation.color} online={conversation.online} />
            <span className="conversation-copy"><span className="conversation-name-line"><strong>{conversation.name}</strong><time>{conversation.time}</time></span><span className="conversation-preview">{conversation.preview}</span></span>
            {conversation.unread && <span className="unread-dot" aria-label={`${conversation.unread} unread messages`} />}
          </button>)}
          {!visibleConversations.length && <div className="empty-search"><Search size={19} /><strong>No messages found</strong><span>Try a different name or keyword.</span></div>}
        </div>
        <div className="list-foot"><span><LockKeyhole size={12} /> Demo preview · messages stay in this browser</span></div>
      </aside>}
    </>}

    {route === 'messages' && <main className={`main-panel chat-panel ${mobileChatOpen ? 'mobile-chat-visible' : ''}`}>
      <header className="chat-header">
        <button className="icon-button mobile-back" aria-label="Back to messages" onClick={() => setMobileChatOpen(false)}><ArrowLeft size={18} /></button>
        <button className="chat-person" onClick={() => { setProfileDraft(active.name); setProfileDialog(true) }} aria-label={`View ${active.name} profile`}><Avatar name={active.name} initials={active.initials} color={active.color} online={active.online} /><span className="chat-person-info"><strong>{active.name}</strong><small><i className={active.online ? 'online-status' : 'offline-status'} />{active.online ? 'Online' : 'Last seen recently'}</small></span></button>
        <div className="chat-header-actions"><button className="icon-button" aria-label="Conversation options" onClick={() => showNotice('This is a local demo conversation.')}><MoreHorizontal size={19} /></button></div>
      </header>
      <section className="chat-scroll" aria-label={`Conversation with ${active.name}`}>
        <div className="message-column">
          <div className="demo-notice"><span className="notice-lock"><LockKeyhole size={12} /></span><span>Preview conversation · messages are only shown locally</span></div>
          <div className="day-marker"><span />Today<span /></div>
          {active.messages.length === 0 && <div className="empty-chat"><Avatar name={active.name} initials={active.initials} color={active.color} size="lg" /><h2>A quiet beginning</h2><p>Send a message to start a one-to-one conversation with {active.name}.</p></div>}
          {active.messages.map((message, index) => <MessageBubble key={message.id} message={message} active={active} firstInGroup={index === 0 || active.messages[index - 1]?.mine !== message.mine} />)}
          <div ref={endRef} />
        </div>
      </section>
      <div className="composer-area">
        <form className="composer" onSubmit={sendMessage}>
          <input ref={fileInputRef} className="visually-hidden" type="file" onChange={(event) => handleFileChange(event)} />
          <input ref={imageInputRef} className="visually-hidden" type="file" accept="image/*" onChange={(event) => handleFileChange(event, true)} />
          <textarea aria-label={`Message ${active.name}`} placeholder="Type a message…" value={draft} onChange={(event) => setDraft(event.target.value)} onKeyDown={(event) => { if (event.key === 'Enter' && !event.shiftKey) { event.preventDefault(); sendMessage() } }} rows={1} />
          {emojiOpen && <div className="emoji-popover" role="group" aria-label="Choose an emoji">{emojiOptions.map((emoji) => <button key={emoji} type="button" onClick={() => setDraft((value) => `${value}${emoji}`)}>{emoji}</button>)}</div>}
          <div className="composer-bottom"><div className="composer-tools"><button type="button" className="composer-tool" aria-label="Attach a file" onClick={() => fileInputRef.current?.click()}><Paperclip size={17} /></button><button type="button" className="composer-tool image-tool" aria-label="Add an image" onClick={() => imageInputRef.current?.click()}><Image size={17} /></button><button type="button" className="composer-tool emoji-tool" aria-label="Choose an emoji" aria-expanded={emojiOpen} onClick={() => setEmojiOpen(!emojiOpen)}><Smile size={17} /></button></div><span className="send-hint">Enter to send</span><button className="send-button" type="submit" aria-label="Send message" disabled={!draft.trim()}><Send size={15} /></button></div>
        </form>
        <div className="composer-caption"><span><LockKeyhole size={11} />Local demo only</span><span>Shift + Enter for a new line</span></div>
      </div>
    </main>}

    {route === 'settings' && <main className="main-panel settings-page">
      <header className="settings-header"><h1>Settings</h1><p>Make GraPhex feel like yours.</p></header>
      <div className="settings-layout">
        <nav className="settings-nav" aria-label="Settings categories">{settingsItems.map(({ id, label, icon: Icon }) => <button key={id} className={settingsTab === id ? 'settings-nav-active' : ''} aria-current={settingsTab === id ? 'page' : undefined} onClick={() => setSettingsTab(id)}><Icon size={17} /><span>{label}</span></button>)}</nav>
        <section className="settings-content" aria-live="polite"><SettingsContent tab={settingsTab} theme={appearance} setTheme={setSelectedTheme} privatePresence={privatePresence} setPrivatePresence={setPrivatePresence} readReceipts={readReceipts} setReadReceipts={setReadReceipts} compactDensity={compactDensity} setCompactDensity={setCompactDensity} displayName={displayName} onEditProfile={() => { setProfileDraft(displayName); setProfileDialog(true) }} onOpenAuth={() => { setAuthMode('login'); setRoute('auth') }} onExport={() => {
          const data = JSON.stringify({ displayName, conversations: conversations.map(({ id, name, messages }) => ({ id, name, messages })) }, null, 2)
          const url = URL.createObjectURL(new Blob([data], { type: 'application/json' })); const anchor = document.createElement('a'); anchor.href = url; anchor.download = 'graphex-preview-data.json'; anchor.click(); URL.revokeObjectURL(url); showNotice('Local preview data exported')
        }} onReset={() => setConfirmReset(true)} /> </section>
      </div>
    </main>}

    {route === 'auth' && <main className="auth-page">
      <section className="auth-brand-panel"><BrandMark /><div className="auth-brand-copy"><h1>A quieter place<br />to talk.</h1><p>Thoughtful conversations, held close.</p><span className="brand-rule" /></div><div className="auth-brand-footer">GraPhex · Private by design</div></section>
      <section className="auth-form-panel"><div className="auth-card">
        <button className="auth-mobile-brand" onClick={() => setAuthMode('login')}><BrandMark /></button>
        {authMode !== 'forgot' && <div className="auth-tabs" role="tablist" aria-label="Authentication"><button role="tab" aria-selected={authMode === 'login'} className={authMode === 'login' ? 'auth-tab-active' : ''} onClick={() => { setAuthMode('login'); setAuthError(''); setAuthNotice('') }}>Log in</button><button role="tab" aria-selected={authMode === 'signup'} className={authMode === 'signup' ? 'auth-tab-active' : ''} onClick={() => { setAuthMode('signup'); setAuthError(''); setAuthNotice('') }}>Sign up</button></div>}
        <div className="auth-heading"><h2>{authMode === 'login' ? 'Welcome back' : authMode === 'signup' ? 'Create your account' : 'Reset your password'}</h2><p>{authMode === 'login' ? 'Log in to your GraPhex account.' : authMode === 'signup' ? 'A little more connected, a little more human.' : 'We’ll help you get back into your account.'}</p></div>
        {authMode === 'forgot' ? <form className="auth-form" onSubmit={submitAuth}><label>Email address<input name="email" type="email" placeholder="you@example.com" autoComplete="email" required /></label>{authError && <p className="form-feedback form-error" role="alert">{authError}</p>}{authNotice && <p className="form-feedback" role="status">{authNotice}</p>}<button className="primary-action" type="submit">Continue</button><button className="text-action" type="button" onClick={() => { setAuthMode('login'); setAuthNotice('') }}>Back to log in</button></form> : <form className="auth-form" onSubmit={submitAuth}>
          {authMode === 'signup' && <label>Display name<input name="displayName" placeholder="Your name" autoComplete="name" required minLength={2} /></label>}
          {authMode === 'signup' && <label>Username<input name="username" placeholder="Choose a username" autoComplete="username" required minLength={3} pattern="[A-Za-z0-9_.-]+" title="Use letters, numbers, periods, underscores or hyphens." /></label>}
          <label>{authMode === 'login' ? 'Email or username' : 'Email address'}<input name="identity" type={authMode === 'login' ? 'text' : 'email'} placeholder={authMode === 'login' ? 'Email or username' : 'you@example.com'} autoComplete={authMode === 'login' ? 'username' : 'email'} required /></label>
          <label>Password<span className="password-input"><input name="password" type={showPassword ? 'text' : 'password'} placeholder={authMode === 'login' ? 'Your password' : 'Create a password'} autoComplete={authMode === 'login' ? 'current-password' : 'new-password'} minLength={8} required /><button type="button" aria-label={showPassword ? 'Hide password' : 'Show password'} onClick={() => setShowPassword(!showPassword)}>{showPassword ? <EyeOff size={16} /> : <Eye size={16} />}</button></span></label>
          {authMode === 'signup' && <label>Confirm password<input name="confirmPassword" type={showPassword ? 'text' : 'password'} placeholder="Enter your password again" autoComplete="new-password" minLength={8} required /></label>}
          {authMode === 'login' && <button className="forgot-link" type="button" onClick={() => { setAuthMode('forgot'); setAuthNotice(''); setAuthError('') }}>Forgot password?</button>}
          {authError && <p className="form-feedback form-error" role="alert">{authError}</p>}{authNotice && <p className="form-feedback" role="status">{authNotice}</p>}
          <button className="primary-action" type="submit">{authMode === 'login' ? 'Log in' : 'Create account'}</button>
          <p className="auth-footnote">This is a frontend preview. No account details are sent.</p>
        </form>}
      </div><div className="auth-bottom"><BrandMark compact /><span>Private by design</span></div></section>
    </main>}

    {route !== 'auth' && <nav className="mobile-nav" aria-label="Mobile navigation"><button className={route === 'messages' ? 'mobile-nav-active' : ''} onClick={() => openRoute('messages')}><MessageCircle size={19} /><span>Messages</span></button><button className={route === 'settings' ? 'mobile-nav-active' : ''} onClick={() => openRoute('settings')}><Settings size={19} /><span>Settings</span></button></nav>}
    {profileOpen && <div className="profile-menu" role="menu"><div className="profile-menu-heading"><Avatar name={displayName} initials="UJ" color="portrait" /><span><strong>{displayName}</strong><small>@{previewUser.username}</small></span><button aria-label="Close profile menu" onClick={() => setProfileOpen(false)}><X size={15} /></button></div><button role="menuitem" onClick={() => { setProfileDraft(displayName); setProfileDialog(true); setProfileOpen(false) }}><UserRound size={15} />View profile</button><button role="menuitem" onClick={() => { setProfileOpen(false); setAuthMode('login'); setRoute('auth') }}><LogOut size={15} />Open sign-in preview</button></div>}
    {profileDialog && <Modal title="Your profile" onClose={() => setProfileDialog(false)}><div className="profile-edit"><Avatar name={displayName} initials="UJ" color="portrait" size="lg" /><label>Display name<input value={profileDraft} onChange={(event) => setProfileDraft(event.target.value)} maxLength={40} /></label><label>Username<input value="@chipas.paglu" readOnly /></label><p>Your profile changes stay in this local preview.</p><button className="primary-action" onClick={() => { if (profileDraft.trim()) setDisplayName(profileDraft.trim()); setProfileDialog(false); showNotice('Profile updated in this preview') }}>Save changes</button></div></Modal>}
    {showNewMessage && <Modal title="New message" onClose={() => { setShowNewMessage(false); setRecipient('') }}><form className="new-message-form" onSubmit={startConversation}><p>Start a one-to-one conversation. This preview creates it locally.</p><label>Name or username<input autoFocus value={recipient} onChange={(event) => setRecipient(event.target.value)} placeholder="e.g. sam.lee" required /></label><button className="primary-action" type="submit" disabled={!recipient.trim()}>Start conversation</button></form></Modal>}
    {confirmReset && <Modal title="Reset local preview?" onClose={() => setConfirmReset(false)}><div className="confirm-content"><p>This resets your local demo messages and returns to the login screen. No server account or remote data will be changed.</p><div><button className="secondary-action" onClick={() => setConfirmReset(false)}>Cancel</button><button className="destructive-action" onClick={resetPreview}>Reset preview</button></div></div></Modal>}
    {notice && <div className="toast" role="status"><Check size={15} />{notice}</div>}
  </div>
}

function MessageBubble({ message, active, firstInGroup }: { message: Message; active: Conversation; firstInGroup: boolean }) {
  return <div className={`message-row ${message.mine ? 'message-outgoing' : 'message-incoming'} ${firstInGroup ? 'message-first' : ''}`}>
    {!message.mine && (firstInGroup ? <Avatar name={active.name} initials={active.initials} color={active.color} size="sm" /> : <span className="avatar-gap" />)}
    <div className="message-body">{!message.mine && firstInGroup && <span className="message-sender">{active.name}</span>}<div className={`message-bubble ${message.mine ? 'bubble-outgoing' : ''}`}>{message.attachment && <FileText size={15} />}{message.text}</div><div className="message-time">{message.time}{message.mine && (message.read ? <CheckCheck size={12} /> : <Check size={12} />)}</div></div>
  </div>
}

function SettingsContent({ tab, theme, setTheme, privatePresence, setPrivatePresence, readReceipts, setReadReceipts, compactDensity, setCompactDensity, displayName, onEditProfile, onOpenAuth, onExport, onReset }: {
  tab: SettingsTab; theme: Theme; setTheme: (theme: Theme) => void; privatePresence: boolean; setPrivatePresence: (value: boolean) => void; readReceipts: boolean; setReadReceipts: (value: boolean) => void; compactDensity: boolean; setCompactDensity: (value: boolean) => void; displayName: string; onEditProfile: () => void; onOpenAuth: () => void; onExport: () => void; onReset: () => void;
}) {
  if (tab === 'account') return <><SettingsTitle title="Account" description="Manage your profile and account details." /><div className="account-card"><div className="account-identity"><Avatar name={displayName} initials="UJ" color="portrait" size="lg" /><div><strong>{displayName}</strong><small>@{previewUser.username}</small></div><button className="secondary-action" onClick={onEditProfile}>Edit profile</button></div><SettingLine label="Display name" value={displayName} onClick={onEditProfile} /><SettingLine label="Username" value={`@${previewUser.username}`} onClick={onEditProfile} /><SettingLine label="Email address" value="Not connected" onClick={() => {}} muted /></div><div className="setting-section-head"><h3>Account actions</h3><p>Manage data in this local preview.</p></div><div className="account-actions"><button onClick={onExport}><Download size={16} /><span><strong>Export preview data</strong><small>Download local demo messages as JSON</small></span><ChevronRight size={16} /></button><button className="delete-action" onClick={onReset}><Trash2 size={16} /><span><strong>Reset local preview</strong><small>Clear local edits and return to sign in</small></span><ChevronRight size={16} /></button><button onClick={onOpenAuth}><LogOut size={16} /><span><strong>Open sign-in preview</strong><small>Explore login and sign-up screens</small></span><ChevronRight size={16} /></button></div></>
  if (tab === 'appearance') return <><SettingsTitle title="Appearance" description="Choose how GraPhex looks on this device." /><div className="appearance-choices" role="radiogroup" aria-label="Theme"><ThemeChoice value="dark" current={theme} setTheme={setTheme} icon={Moon} title="Dark" description="Quiet contrast, day or night." /><ThemeChoice value="light" current={theme} setTheme={setTheme} icon={Sun} title="Light" description="A bright, paper-like canvas." /><ThemeChoice value="system" current={theme} setTheme={setTheme} icon={Laptop} title="System" description="Follow your device setting." /></div><div className="setting-section-head"><h3>Density</h3><p>Set the amount of space in your conversation list.</p></div><PreferenceRow icon={SlidersHorizontal} title="Compact spacing" description="Show more conversations at once." control={<Toggle checked={compactDensity} onChange={setCompactDensity} label="Compact spacing" />} /></>
  if (tab === 'privacy') return <><SettingsTitle title="Privacy" description="Choose what you share in this local preview." /><div className="privacy-callout"><Shield size={18} /><span><strong>Preview mode</strong><small>No messages or profile data are sent to a server.</small></span></div><PreferenceRow icon={UserRound} title="Show online status" description="Let people see when you’re around." control={<Toggle checked={!privatePresence} onChange={(value) => setPrivatePresence(!value)} label="Show online status" />} /><PreferenceRow icon={CheckCheck} title="Read receipts" description="Show when you’ve read a message." control={<Toggle checked={readReceipts} onChange={setReadReceipts} label="Read receipts" />} /></>
  return <><SettingsTitle title="General" description="A few details about how GraPhex behaves." /><PreferenceRow icon={SlidersHorizontal} title="Compact spacing" description="Reduce conversation list spacing." control={<Toggle checked={compactDensity} onChange={setCompactDensity} label="Compact spacing" />} /><PreferenceRow icon={CircleHelp} title="Keyboard shortcuts" description="Enter sends · Shift + Enter adds a line." control={<span className="setting-value">Enabled</span>} /><div className="general-note">GraPhex preview · Frontend only</div></>
}

function SettingsTitle({ title, description }: { title: string; description: string }) { return <div className="settings-title"><h2>{title}</h2><p>{description}</p></div> }
function SettingLine({ label, value, onClick, muted = false }: { label: string; value: string; onClick: () => void; muted?: boolean }) { return <button className="setting-line" onClick={onClick} disabled={muted}><span>{label}</span><span className={muted ? 'value-muted' : ''}>{value}</span>{!muted && <ChevronRight size={15} />}</button> }
function ThemeChoice({ value, current, setTheme, icon: Icon, title, description }: { value: Theme; current: Theme; setTheme: (theme: Theme) => void; icon: LucideIcon; title: string; description: string }) { return <button className={`theme-choice ${current === value ? 'theme-choice-active' : ''}`} role="radio" aria-checked={current === value} onClick={() => setTheme(value)}><span className="theme-preview"><span /><span /><span /></span><span className="theme-choice-meta"><span className="theme-choice-icon"><Icon size={15} /></span><strong>{title}</strong><small>{description}</small></span>{current === value && <span className="theme-check"><Check size={12} /></span>}</button> }
function PreferenceRow({ icon: Icon, title, description, control }: { icon: LucideIcon; title: string; description: string; control: ReactNode }) { return <div className="preference-row"><span className="preference-icon"><Icon size={16} /></span><span className="preference-copy"><strong>{title}</strong><small>{description}</small></span>{control}</div> }
function Toggle({ checked, onChange, label }: { checked: boolean; onChange: (value: boolean) => void; label: string }) { return <button role="switch" aria-checked={checked} aria-label={label} className={`toggle ${checked ? 'toggle-on' : ''}`} onClick={() => onChange(!checked)}><i /></button> }
function Modal({ title, children, onClose }: { title: string; children: ReactNode; onClose: () => void }) { return <div className="modal-scrim" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose() }}><section className="modal" role="dialog" aria-modal="true" aria-label={title}><header><h2>{title}</h2><button className="icon-button" aria-label="Close dialog" onClick={onClose}><X size={17} /></button></header>{children}</section></div> }

export default App
