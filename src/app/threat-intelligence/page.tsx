'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { ArrowRight, Coffee, FileText, FolderOpen, Paperclip, ShieldCheck, X } from 'lucide-react';
import { PageTitle } from '@/components/chrome';
import { EMPTY_PROGRESS, loadProgress, saveProgress, trainingModules, type TrainingProgress, type TrainingModule } from '@/lib/training';

const departments = ['Foundational Training', 'Technical Training', 'Special Investigations'] as const;

export default function ThreatIntelligence() {
  const [progress, setProgress] = useState<TrainingProgress>(EMPTY_PROGRESS);
  const [selectedFile, setSelectedFile] = useState<TrainingModule | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => { setProgress(loadProgress()); setReady(true); }, []);
  useEffect(() => { if (ready) saveProgress(progress); }, [progress, ready]);
  useEffect(() => {
    if (!selectedFile) return;
    const onKeyDown = (event: KeyboardEvent) => { if (event.key === 'Escape') setSelectedFile(null); };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [selectedFile]);

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
          <a className="btn" href="#training-archive">Enter the training archive <ArrowRight size={16}/></a>
        </div>
        <div className="training-hero-illustration"><Image src="/images/dunder-mifflin-computer-logo.png" alt="Dunder Mifflin office computer" fill priority sizes="(max-width: 760px) 150px, 36vw" /></div>
        <div className="training-memo-stamp" aria-hidden="true"><ShieldCheck size={16}/> INTERNAL / SS-INTEL</div>
      </div>
    </section>

    <section className="section training-section" id="training-archive">
      <div className="wrap">
        <PageTitle kicker="Dunder Mifflin / Scranton Branch" title="The Branch Training Archive" description="Eight files. One safer branch. Every employee has a role in keeping the branch secure. Dwight is watching." />

        <section className="archive-desk" aria-label="Cybersecurity training file archive">
          <div className="archive-desk-header"><div><span className="eyebrow">Cybersecurity Division / File Cabinet B</span><p>Authorized employees only · Select a folder to review its document</p></div><div className="archive-desk-tools" aria-hidden="true"><span className="archive-sticky">Dwight says:<br/>Read the policy.</span><span className="archive-coffee"><Coffee size={25}/></span><Paperclip size={25}/></div></div>
          <div className="archive-cabinet">
            {departments.map((department) => <section className={`archive-department archive-department-${department.startsWith('Foundational') ? 'foundational' : department.startsWith('Technical') ? 'technical' : 'special'}`} key={department}>
              <div className="archive-department-heading"><span className="archive-category-tab"/><div><span className="eyebrow">Department file / {String(departments.indexOf(department) + 1).padStart(2, '0')}</span><h2>{department}</h2></div><span className="archive-file-count">{trainingModules.filter((item) => item.department === department).length} files</span></div>
              <div className="archive-folder-list">
                {trainingModules.filter((item) => item.department === department).map((module) => {
                  const done = progress.completedModules.includes(module.id);
                  const completed = module.lessons.filter((_, i) => progress.completedLessons.includes(`${module.id}:${i}`)).length;
                  return <button type="button" className="archive-folder" key={module.id} onClick={() => setSelectedFile(module)} aria-label={`Open preview for file ${module.number}: ${module.title}`}>
                    <span className="archive-folder-tab">FILE {module.number}</span><span className="archive-folder-icon"><FolderOpen size={24}/></span>
                    <span className="archive-folder-main"><strong>{module.title}</strong><small>{module.description}</small></span>
                    <span className="archive-folder-meta"><span>{module.level}</span><span>{completed}/{module.lessons.length} lessons</span></span>
                    {done&&<span className="archive-reviewed" aria-label="Reviewed">REVIEWED</span>}
                  </button>;
                })}
              </div>
            </section>)}
          </div>
          <p className="archive-footer-note">“Please return all training files to their designated cabinet. Dwight is checking.”</p>
        </section>

        <aside className="training-threat-desk"><div className="eyebrow">From the threat desk</div><h2>Real-world threats. Real lessons.</h2><p>Review the separate public threat feed, then return here to learn the defensive concepts behind it. Live activity is labeled by source and what it can verify.</p><Link href="/threat-watch" className="btn secondary">Open Global Threat Watch <ArrowRight size={15}/></Link><p className="training-sim-note">Training scenarios in these files are educational examples, not live incident reports.</p></aside>
      </div>
    </section>

    {selectedFile&&<div className="archive-preview-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setSelectedFile(null); }}><section className="archive-preview" role="dialog" aria-modal="true" aria-labelledby="archive-preview-title"><button className="archive-preview-close" onClick={() => setSelectedFile(null)} aria-label="Close document preview"><X size={20}/></button><div className="archive-preview-brand"><span className="eyebrow">Schrute Security · Cybersecurity Intelligence Division</span><span className="archive-preview-file">FILE {selectedFile.number}</span></div><div className="archive-preview-heading"><span className="tag">TRAINING DOCUMENT</span><h2 id="archive-preview-title">{selectedFile.title}</h2><p>{selectedFile.description}</p></div><div className="archive-preview-meta"><p><b>Assigned department:</b> Cybersecurity Intelligence</p><p><b>Document owner:</b> {selectedFile.character}</p><p><b>Classification:</b> Employee Training</p><p><b>Difficulty:</b> {selectedFile.level}</p><p><b>Estimated reading time:</b> {selectedFile.minutes} minutes</p></div><p className="archive-preview-note"><b>{selectedFile.character}&apos;s note</b><br/><i>“{selectedFile.characterNote}”</i></p><div className="archive-preview-contents"><h3><FileText size={16}/> Document contents</h3><ol>{selectedFile.lessons.map((item) => <li key={item.title}>{item.title}</li>)}</ol><div className="archive-preview-objectives"><b>Training objectives</b><div>{selectedFile.topics.map((topic) => <span className="tag" key={topic}>{topic}</span>)}</div></div></div><Link className="btn archive-open-document" href={`/threat-intelligence/module/${selectedFile.id}`}><span>OPEN TRAINING DOCUMENT</span><small>Begin lesson 01</small></Link></section></div>}
  </main>;
}
