import { useEffect, useMemo, useState } from 'react'
import {
  Activity, BarChart3, BookOpen, CheckCircle2, ChevronRight, Clock3,
  Code2, Database, FileCheck2, LayoutDashboard, Menu, MessageCircle,
  Pencil, Play, Save, Search, Settings2, ShieldCheck, Sparkles, UserRound, X
} from 'lucide-react'
import { api } from './services/api'

const fallbackProfile = {
  name: 'Abdul Baseeth',
  degree: 'B.Sc Data Science',
  college: 'Student',
  email: 'student@example.com',
  linkedin: '',
  github: '',
  about: 'Data science student building practical, evidence-based skills.'
}

function App() {
  const [page, setPage] = useState('dashboard')
  const [profile, setProfile] = useState(fallbackProfile)
  const [tasks, setTasks] = useState([])
  const [evidence, setEvidence] = useState([])
  const [session, setSession] = useState(null)
  const [toast, setToast] = useState('')
  const [mobileOpen, setMobileOpen] = useState(false)
  const [loading, setLoading] = useState(true)

  const refresh = async () => {
    try {
      const [p, t, e] = await Promise.all([api.profile(), api.tasks(), api.evidence()])
      setProfile(p); setTasks(t); setEvidence(e)
    } catch (err) {
      setToast('Backend not connected. Start FastAPI on port 8000.')
    } finally { setLoading(false) }
  }

  useEffect(() => { refresh() }, [])

  const nav = [
    ['dashboard', 'Dashboard', LayoutDashboard],
    ['tasks', 'Tasks', BookOpen],
    ['workroom', 'Workroom', Code2],
    ['proof', 'My Proof', ShieldCheck],
    ['skills', 'Skills', BarChart3],
    ['activity', 'Activity', Activity]
  ]

  const go = (id) => {
    setPage(id)
    setMobileOpen(false)
  }

  const startTask = async (task) => {
    try {
      const s = await api.startSession(task.id)
      setSession(s)
      setPage('workroom')
    } catch (err) { setToast(err.message) }
  }

  const notify = (msg) => {
    setToast(msg)
    setTimeout(() => setToast(''), 2600)
  }

  if (loading) return <div className="loading">Loading SkillProof…</div>

  return (
    <div className="app">
      <aside className={`sidebar ${mobileOpen ? 'open' : ''}`}>
        <div className="brand"><div className="brand-mark">S</div><div><strong>SkillProof</strong><span>Proof over claims</span></div></div>
        <div className="nav-label">Workspace</div>
        <nav>
          {nav.map(([id, label, Icon]) => (
            <button key={id} className={page === id ? 'nav-item active' : 'nav-item'} onClick={() => go(id)}>
              <Icon size={18}/><span>{label}</span>
            </button>
          ))}
        </nav>
        <div className="sidebar-bottom">
          <button className="nav-item" onClick={() => go('profile')}><UserRound size={18}/><span>Profile</span></button>
          <div className="mini-profile"><div className="avatar">{profile.name.split(' ').map(x=>x[0]).join('').slice(0,2)}</div><div><b>{profile.name}</b><small>{profile.degree}</small></div></div>
        </div>
      </aside>

      <main className="main">
        <header className="topbar">
          <button className="mobile-menu" onClick={() => setMobileOpen(v=>!v)}><Menu/></button>
          <div className="crumb">{page === 'workroom' ? 'Workroom' : page.replace('-', ' ')}</div>
          <div className="top-actions"><div className="avatar">{profile.name.split(' ').map(x=>x[0]).join('').slice(0,2)}</div><span>{profile.name}</span></div>
        </header>

        <div className="content">
          {page === 'dashboard' && <Dashboard profile={profile} tasks={tasks} evidence={evidence} startTask={startTask} go={go}/>}
          {page === 'tasks' && <Tasks tasks={tasks} startTask={startTask}/>}
          {page === 'workroom' && <Workroom session={session} setSession={setSession} notify={notify} go={go}/>}
          {page === 'proof' && <Proof profile={profile} evidence={evidence} notify={notify}/>}
          {page === 'skills' && <Skills evidence={evidence}/>}
          {page === 'activity' && <ActivityPage evidence={evidence}/>}
          {page === 'profile' && <Profile profile={profile} setProfile={setProfile} notify={notify}/>}
        </div>
      </main>

      {toast && <div className="toast">{toast}</div>}
    </div>
  )
}

function PageTitle({eyebrow, title, text, action}) {
  return <div className="page-title"><div><div className="eyebrow">{eyebrow}</div><h1>{title}</h1>{text && <p>{text}</p>}</div>{action}</div>
}

function Dashboard({profile, tasks, evidence, startTask, go}) {
  const demonstrated = new Set(evidence.map(e=>e.skill)).size
  return <div>
    <PageTitle eyebrow="Overview" title={`Welcome back, ${profile.name.split(' ')[0]}.`} text="Build proof by completing practical work, not by collecting claims." />
    <div className="stats">
      <Stat label="Skills Demonstrated" value={demonstrated || 0} icon={CheckCircle2}/>
      <Stat label="Tasks Completed" value={evidence.length} icon={FileCheck2}/>
      <Stat label="Proof Profile" value={evidence.length ? 'Strong' : 'Building'} icon={ShieldCheck}/>
    </div>
    <section className="section"><div className="section-head"><h2>Recommended tasks</h2><button className="link-btn" onClick={()=>go('tasks')}>View all <ChevronRight size={16}/></button></div>
      <div className="task-grid">{tasks.slice(0,3).map(t=><TaskCard key={t.id} task={t} onStart={()=>startTask(t)}/>)}</div>
    </section>
    <section className="section"><div className="section-head"><h2>Recent activity</h2></div>
      <div className="activity-card">{evidence.length ? evidence.slice(0,4).map(e=><ActivityRow key={e.id} e={e}/>) : <Empty text="Complete your first task to start building evidence."/>}</div>
    </section>
  </div>
}

function Stat({label,value,icon:Icon}) {
  return <div className="stat"><div className="icon-box"><Icon size={19}/></div><div><span>{label}</span><strong>{value}</strong></div></div>
}

function Tasks({tasks,startTask}) {
  const [q,setQ] = useState('')
  const [filter,setFilter] = useState('All')
  const categories = ['All','Python','Excel','Power BI','Data Analysis','Canva','SQL']
  const shown = tasks.filter(t => (filter==='All'||t.skill===filter) && `${t.title} ${t.skill} ${t.description}`.toLowerCase().includes(q.toLowerCase()))
  return <div>
    <PageTitle eyebrow="Task Library" title="Real-world tasks" text="Choose a practical challenge and prove what you can actually do." />
    <div className="toolbar"><div className="search"><Search size={17}/><input value={q} onChange={e=>setQ(e.target.value)} placeholder="Search tasks..." /></div><div className="filters">{categories.map(c=><button key={c} className={filter===c?'filter active':'filter'} onClick={()=>setFilter(c)}>{c}</button>)}</div></div>
    <div className="task-grid">{shown.map(t=><TaskCard key={t.id} task={t} onStart={()=>startTask(t)}/>)}</div>
    {!shown.length && <Empty text="No tasks match your search."/>}
  </div>
}

function TaskCard({task,onStart}) {
  return <article className="task-card"><div className="task-top"><span className="tag">{task.skill}</span><span className="difficulty">{task.difficulty}</span></div><h3>{task.title}</h3><p>{task.description}</p><div className="task-meta"><span><Clock3 size={15}/> {task.estimated_minutes} min</span><span><Code2 size={15}/> Workroom</span></div><button className="primary" onClick={onStart}>Start Task <ChevronRight size={16}/></button></article>
}

function Workroom({session,setSession,notify,go}) {
  const [code,setCode] = useState(session?.current_code || '')
  const [output,setOutput] = useState('')
  const [mentorInput,setMentorInput] = useState('')
  const [messages,setMessages] = useState([{role:'ai',text:'Hi! I am SkillGuide. I can give hints and explain concepts, but I will not do the task for you.'}])
  const [evaluation,setEvaluation] = useState(null)
  const [check,setCheck] = useState(null)
  const [answers,setAnswers] = useState({})
  const [busy,setBusy] = useState(false)

  useEffect(()=>{ if(session) setCode(session.current_code || session.task?.starter_code || '') },[session])

  if (!session) return <div className="empty-work"><Code2 size={38}/><h2>No active session</h2><p>Choose a task from the Task Library to enter the Workroom.</p><button className="primary" onClick={()=>go('tasks')}>Browse tasks</button></div>

  const save = async () => {
    setBusy(true)
    try {
      const s = await api.saveVersion(session.id, code, 'Student saved a version')
      setSession(s); notify('Version saved')
    } catch(e){ notify(e.message) } finally { setBusy(false) }
  }

  const run = async () => {
    setBusy(true)
    try { const r = await api.runCode(session.id, code); setOutput(r.output) }
    catch(e){ setOutput(e.message) } finally { setBusy(false) }
  }

  const askMentor = async () => {
    if (!mentorInput.trim()) return
    const q = mentorInput; setMentorInput('')
    setMessages(m=>[...m,{role:'user',text:q}])
    try { const r=await api.mentor(session.id,q); setMessages(m=>[...m,{role:'ai',text:r.message}]) }
    catch(e){ notify(e.message) }
  }

  const evaluate = async () => {
    setBusy(true)
    try { const r=await api.evaluate(session.id); setEvaluation(r) }
    catch(e){ notify(e.message) } finally { setBusy(false) }
  }

  const submitCheck = async () => {
    try {
      const r=await api.submitCheck(session.id, answers)
      setCheck(r)
      if(r.passed) notify('Understanding check passed — evidence created.')
      else notify('Understanding needs another attempt.')
    } catch(e){ notify(e.message) }
  }

  return <div>
    <div className="work-header"><div><div className="eyebrow">{session.task.skill} • {session.task.difficulty}</div><h1>{session.task.title}</h1></div><div className="work-actions"><button className="secondary" onClick={save}><Save size={16}/> Save</button><button className="primary" onClick={evaluate}><FileCheck2 size={16}/> Submit for AI Evaluation</button></div></div>
    <div className="work-grid">
      <aside className="work-panel brief"><h3>Task Brief</h3><div className="scenario">{session.task.scenario}</div><h4>Requirements</h4><ul>{session.task.requirements.map((r,i)=><li key={i}>{r}</li>)}</ul><h4>Resources</h4><div className="resource">{session.task.resource || 'No external resource required.'}</div><div className="session-status"><span className="dot"></span> Session active</div></aside>
      <section className="work-panel editor-panel"><div className="editor-head"><span>main.py</span><span>Autosave ready</span></div><textarea value={code} onChange={e=>setCode(e.target.value)} spellCheck="false"/><div className="editor-actions"><button className="secondary" onClick={run} disabled={busy}><Play size={15}/> Run</button><button className="secondary" onClick={save}><Save size={15}/> Save Version</button></div><div className="output"><div className="output-title">Output</div><pre>{output || 'Run your work to see the output here.'}</pre></div></section>
      <aside className="work-panel mentor"><div className="mentor-head"><div className="ai-icon"><Sparkles size={17}/></div><div><b>SkillGuide</b><small>Guidance, not solutions</small></div></div><div className="messages">{messages.map((m,i)=><div key={i} className={m.role==='user'?'msg user':'msg'}>{m.text}</div>)}</div><div className="mentor-note">SkillGuide helps you think. It doesn't do the task for you.</div><div className="mentor-input"><input value={mentorInput} onChange={e=>setMentorInput(e.target.value)} onKeyDown={e=>e.key==='Enter'&&askMentor()} placeholder="Ask for a hint..." /><button onClick={askMentor}><MessageCircle size={16}/></button></div></aside>
    </div>
    {evaluation && <Modal title="AI Evaluation"><div className="score">{evaluation.score}%<span>Demonstration score</span></div><div className="criteria">{Object.entries(evaluation.criteria).map(([k,v])=><div key={k}><span>{k}</span><b>{v}</b></div>)}</div><p className="muted">The criteria matter more than the numeric score. Complete the understanding check before evidence is finalized.</p><button className="primary full" onClick={()=>{setCheck(evaluation.understanding_check);setEvaluation(null)}}>Continue to Understanding Check</button></Modal>}
    {check && !check.passed && check.questions && <Modal title="Understanding Check"><p className="muted">Answer these questions based on your submitted work.</p>{check.questions.map((q,i)=><div className="question" key={i}><b>{i+1}. {q.question}</b><input value={answers[i]||''} onChange={e=>setAnswers({...answers,[i]:e.target.value})} placeholder="Your explanation..." /></div>)}<button className="primary full" onClick={submitCheck}>Submit Understanding Check</button></Modal>}
    {check && check.passed && <Modal title="Skill Demonstrated"><div className="success"><CheckCircle2 size={38}/><h2>Evidence created</h2><p>Your work and understanding are now part of your SkillProof evidence.</p></div><button className="primary full" onClick={()=>{setCheck(null);go('proof')}}>View My Proof</button></Modal>}
  </div>
}

function Modal({title,children}) { return <div className="modal-backdrop"><div className="modal"><div className="modal-head"><h2>{title}</h2></div>{children}</div></div> }

function Proof({profile,evidence}) {
  return <div><PageTitle eyebrow="Evidence" title="My Proof" text="Evidence of demonstrated ability — built from actual work."/><div className="profile-card"><div className="avatar large">{profile.name.split(' ').map(x=>x[0]).join('').slice(0,2)}</div><div><h2>{profile.name}</h2><p>{profile.degree} • {profile.college}</p></div><div className="proof-badge"><ShieldCheck size={16}/> Evidence-based</div></div><div className="section"><div className="section-head"><h2>Demonstrated work</h2></div><div className="evidence-grid">{evidence.length ? evidence.map(e=><div className="evidence-card" key={e.id}><span className="tag">{e.skill}</span><h3>{e.task_title}</h3><p>{e.capabilities}</p><div className="evidence-foot"><span>Score {e.score}%</span><span>{new Date(e.created_at).toLocaleDateString()}</span></div></div>) : <Empty text="No evidence yet. Complete a task to build your proof."/>}</div></div></div>
}

function Skills({evidence}) {
  const skills = ['Python','Power BI','Excel','SQL','Data Analysis','Canva']
  return <div><PageTitle eyebrow="Capabilities" title="Skills Demonstrated" text="We show what you demonstrated — not arbitrary skill scores."/><div className="skill-list">{skills.map(s=>{const ev=evidence.filter(e=>e.skill===s);return <div className="skill-row" key={s}><div className="skill-icon"><Code2 size={17}/></div><div><b>{s}</b><p>{ev.length ? ev[0].capabilities : 'Not demonstrated yet'}</p></div><span className={ev.length?'status demonstrated':'status'}>{ev.length?'Demonstrated':'In progress'}</span></div>})}</div></div>
}

function ActivityPage({evidence}) {
  return <div><PageTitle eyebrow="Timeline" title="Activity" text="A transparent history of your work and proof."/><div className="activity-card">{evidence.length?evidence.map(e=><ActivityRow e={e} key={e.id}/>):<Empty text="No activity yet."/>}</div></div>
}

function ActivityRow({e}) {
  return <div className="activity-row"><div className="timeline-dot"></div><div><b>{e.task_title}</b><p>{e.skill} demonstrated • {e.score}% evaluation</p></div><span>{new Date(e.created_at).toLocaleDateString()}</span></div>
}

function Profile({profile,setProfile,notify}) {
  const [form,setForm]=useState(profile)
  const save=async()=>{try{const p=await api.updateProfile(form);setProfile(p);notify('Profile updated')}catch(e){notify(e.message)}}
  return <div><PageTitle eyebrow="Account" title="Edit Profile" text="Keep your SkillProof identity and professional links up to date."/><div className="form-card">{[['name','Full name'],['degree','Degree / Course'],['college','College'],['email','Email'],['linkedin','LinkedIn URL'],['github','GitHub URL']].map(([k,l])=><label key={k}>{l}<input value={form[k]||''} onChange={e=>setForm({...form,[k]:e.target.value})}/></label>)}<label>About<textarea value={form.about||''} onChange={e=>setForm({...form,about:e.target.value})}/></label><button className="primary" onClick={save}>Save Profile</button></div></div>
}

function Empty({text}) { return <div className="empty"><Database size={25}/><p>{text}</p></div> }

export default App
