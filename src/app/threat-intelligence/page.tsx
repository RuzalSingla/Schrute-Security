'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { ArrowRight, Award, BookOpen, Clock3, ShieldCheck, Sparkles } from 'lucide-react';
import { PageTitle } from '@/components/chrome';
import { BADGES, currentRank, EMPTY_PROGRESS, loadProgress, saveProgress, trainingModules, type TrainingProgress } from '@/lib/training';

export default function ThreatIntelligence() {
  const [progress, setProgress] = useState<TrainingProgress>(EMPTY_PROGRESS);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setProgress(loadProgress());
    setReady(true);
  }, []);

  useEffect(() => {
    if (ready) saveProgress(progress);
  }, [progress, ready]);

  const rank = currentRank(progress.xp);
  const percentage = rank.next ? Math.min(100, ((progress.xp - rank.current.xp) / (rank.next.xp - rank.current.xp)) * 100) : 100;
  const earned = BADGES.filter((badge) => {
    if (badge.id === 'first-lesson') return progress.completedLessons.length > 0;
    if (badge.id === 'phishing') return progress.completedModules.includes('jim-phishing');
    if (badge.id === 'accounts') return progress.completedModules.includes('angela-access');
    if (badge.id === 'backup') return progress.completedModules.includes('pam-privacy');
    if (badge.id === 'threat') return progress.completedModules.includes('kevin-threat-feed');
    return progress.completedModules.length === trainingModules.length;
  });

  return <main className="training-page">
    <section className="training-hero">
      <div className="training-hero-photo"><Image src="/images/training-office.png" alt="The Dunder Mifflin office floor" fill priority sizes="(max-width: 760px) 100vw, 42vw" /></div>
      <div className="training-hero-content wrap">
        <div className="training-hero-copy">
          <div className="eyebrow">Internal memo / Cybersecurity Intelligence Division</div>
          <h1>Threat Intelligence</h1>
          <h2>Fact: The internet is a dangerous place.</h2>
          <p>Welcome to the branch&apos;s Cybersecurity Intelligence Division. Learn how threats operate, investigate suspicious activity, and keep your digital workplace safe.</p>
          <p className="training-hero-quip">Because “I declare security!” is not a cybersecurity strategy.</p>
          <Link className="btn" href="#training-program">Enter the training program <ArrowRight size={16}/></Link>
        </div>
        <div className="training-hero-illustration"><Image src="/images/dunder-mifflin-computer-logo.png" alt="Dunder Mifflin office computer" fill priority sizes="(max-width: 760px) 150px, 36vw" /></div>
        <div className="training-memo-stamp" aria-hidden="true"><ShieldCheck size={16}/> INTERNAL / SS-INTEL</div>
      </div>
    </section>

    <section className="section training-section" id="training-program">
      <div className="wrap">
        <PageTitle kicker="Branch employee learning record" title="The Cybersecurity Training Program" description="Every employee has a role in keeping the branch secure. Dwight is watching." />

        <section className="training-dashboard paper-card" aria-label="Employee training progress">
          <div className="training-rank-icon"><Award size={27}/></div>
          <div className="training-rank-copy"><div className="eyebrow">Schrute Security / Employee ID SS-001</div><span className="training-rank-label">Current rank</span><strong>{rank.current.name}</strong><p>“Dwight has not approved your promotion yet.”</p></div>
          <div className="training-xp-block"><div className="training-xp-numbers"><b>{progress.xp} XP</b><span>{rank.next ? `${rank.next.xp} XP to ${rank.next.name}` : 'Top rank reached'}</span></div><div className="training-progress-track" role="progressbar" aria-label="Progress toward next rank" aria-valuenow={Math.round(percentage)} aria-valuemin={0} aria-valuemax={100}><span style={{ width: `${percentage}%` }}/></div><div className="training-stats"><span><b>{progress.completedModules.length}</b> / 8 modules</span><span><b>{progress.completedLessons.length}</b> lessons complete</span></div></div>
        </section>

        <div className="training-module-heading"><div><span className="eyebrow">Choose your next lesson</span><h2>Eight files. One safer branch.</h2></div><span className="training-count"><BookOpen size={15}/> {progress.completedModules.length} of 8 complete</span></div>
        <div className="training-module-grid">
          {trainingModules.map((module) => {
            const done = progress.completedModules.includes(module.id);
            const completed = module.lessons.filter((_, index) => progress.completedLessons.includes(`${module.id}:${index}`)).length;
            const percent = Math.round((completed / module.lessons.length) * 100);
            return <article className="training-module paper-card" key={module.id}>
              <div className="training-module-photo"><Image src={module.image} alt={`${module.character}, associated with ${module.title}`} fill sizes="(max-width: 700px) 100vw, (max-width: 1050px) 50vw, 25vw" loading="lazy"/><span className="training-module-number">MODULE {module.number}</span><span className={`training-level training-level-${module.level.toLowerCase()}`}>{module.level}</span></div>
              <div className="training-module-content"><div className="training-character">{module.character}&apos;s file</div><h3>{module.title}</h3><p>{module.description}</p>
                <div className="training-topics">{module.topics.slice(0, 3).map((topic) => <span key={topic}>{topic}</span>)}</div>
                <div className="training-module-meta"><span><BookOpen size={14}/> {module.lessons.length} lessons</span><span><Clock3 size={14}/> {module.minutes} min</span></div>
                <div className="training-card-progress"><div><span>File progress</span><b>{done ? 'Complete' : `${percent}%`}</b></div><div className="training-progress-track"><span style={{ width: `${done ? 100 : percent}%` }}/></div></div>
                <Link className="training-start-link" href={`/threat-intelligence/module/${module.id}`}>{done ? 'Review module' : completed ? 'Continue learning' : 'Start learning'} <ArrowRight size={16}/></Link>
              </div>
            </article>;
          })}
        </div>

        <section className="training-bottom-grid">
          <div className="paper-card training-badges"><div className="eyebrow">Performance recognition</div><h2><Sparkles size={19}/> Employee badges</h2><p>Earned locally as you complete training milestones.</p><div className="training-badge-list">{BADGES.map((badge) => {const unlocked = earned.some((item) => item.id === badge.id);return <div className={`training-badge ${unlocked ? 'is-earned' : ''}`} key={badge.id}><Award size={20}/><span><b>{badge.name}</b><small>{badge.detail}</small></span><span className="training-badge-state">{unlocked ? 'Earned' : 'Locked'}</span></div>;})}</div></div>
          <aside className="training-threat-desk"><div className="eyebrow">From the threat desk</div><h2>Real-world threats. Real lessons.</h2><p>Review the separate public threat feed, then return here to learn the defensive concepts behind it. Live activity is labeled by source and what it can verify.</p><Link href="/threat-watch" className="btn secondary">Open Global Threat Watch <ArrowRight size={15}/></Link><p className="training-sim-note">Training scenarios on this page are educational simulations, not live incident reports.</p></aside>
        </section>
      </div>
    </section>
  </main>;
}
