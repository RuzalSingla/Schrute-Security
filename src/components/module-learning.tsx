'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { ArrowLeft, ArrowRight, BookOpenCheck, Check, CheckCircle2, ClipboardCheck, FileText, RotateCcw } from 'lucide-react';
import { PageTitle } from '@/components/chrome';
import { EMPTY_PROGRESS, loadProgress, saveProgress, trainingModules, type TrainingProgress, type TrainingModule } from '@/lib/training';

function ModuleCompletion({ module, score }: { module: TrainingModule; score?: number }) {
  const next = trainingModules[trainingModules.findIndex((item) => item.id === module.id) + 1];
  return <main className="section"><div className="wrap module-wrap"><div className="module-completion-paper paper-card"><div className="eyebrow">Schrute Security / Training archive</div><span className="module-completion-stamp">REVIEWED</span><div className="module-completion-icon"><BookOpenCheck size={30}/></div><div className="eyebrow">File {module.number} · Review complete</div><h1>Document reviewed and filed.</h1><p>You completed the handbook for <b>{module.title}</b>. The concepts below are now filed in the branch record.</p><div className="module-completion-summary">{module.topics.map((topic) => <span key={topic}><Check size={14}/>{topic}</span>)}</div>{score!==undefined&&<p className="module-completion-result">Knowledge check: {score} of 4 correct</p>}<div className="module-completion-actions"><Link className="btn secondary" href="/threat-intelligence">Return to Training Archive</Link>{next&&<Link className="btn" href={`/threat-intelligence/module/${next.id}`}>Continue to File {next.number} <ArrowRight size={15}/></Link>}</div></div></div></main>;
}

export default function ModuleLearning({ moduleId }: { moduleId: string }) {
  const module = trainingModules.find((item) => item.id === moduleId);
  const [progress, setProgress] = useState<TrainingProgress>(EMPTY_PROGRESS);
  const [ready, setReady] = useState(false);
  const [lessonIndex, setLessonIndex] = useState(0);
  const [reviewMode, setReviewMode] = useState(false);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [reviewSubmitted, setReviewSubmitted] = useState(false);

  useEffect(() => { setProgress(loadProgress()); setReady(true); }, []);
  useEffect(() => { if (ready) saveProgress(progress); }, [progress, ready]);

  if (!module) return <main className="section"><div className="wrap"><PageTitle kicker="Training file not found" title="That file is missing" description="Choose an available training module from the employee archive."/><Link className="btn" href="/threat-intelligence">Return to the Training Archive</Link></div></main>;

  const lesson = module.lessons[lessonIndex];
  const allLessonsComplete = module.lessons.every((_, index) => progress.completedLessons.includes(`${module.id}:${index}`));
  if (ready && progress.completedModules.includes(module.id)) return <ModuleCompletion module={module} score={progress.reviewResults[module.id]}/>;

  function markComplete() {
    const id = `${module!.id}:${lessonIndex}`;
    setProgress((old) => old.completedLessons.includes(id) ? old : { ...old, completedLessons: [...old.completedLessons, id] });
  }

  const questions = [
    ...module.lessons.map((item) => ({ prompt: item.question, options: item.options, answer: item.answer, explanation: item.feedback })),
    { prompt: module.reviewTrueFalse.statement, options: ['True', 'False'], answer: module.reviewTrueFalse.answer ? 0 : 1, explanation: module.reviewTrueFalse.explanation },
  ];
  const score = questions.reduce((total, item, index) => total + (answers[index] === String(item.answer) ? 1 : 0), 0);

  function submitReview() {
    if (Object.keys(answers).length < questions.length) return;
    setReviewSubmitted(true);
    setProgress((old) => {
      const reviewResults = { ...old.reviewResults, [module!.id]: score };
      if (score < 3) return { ...old, reviewResults };
      return { ...old, reviewResults, passedReviews: old.passedReviews.includes(module!.id) ? old.passedReviews : [...old.passedReviews, module!.id], completedModules: old.completedModules.includes(module!.id) ? old.completedModules : [...old.completedModules, module!.id] };
    });
  }

  return <main className="section handbook-section"><div className="wrap handbook-wrap"><Link className="module-back" href="/threat-intelligence"><ArrowLeft size={15}/> Return to Training Archive</Link>
    <div className="handbook-masthead"><span className="eyebrow">Schrute Security · Cybersecurity Intelligence Division</span><span className="handbook-file-no">FILE {module.number}</span></div>
    <div className="handbook-mobile-toc"><details><summary><FileText size={16}/> Table of contents · {lessonIndex + 1} of {module.lessons.length}</summary><div>{module.lessons.map((item, index) => <button key={item.title} className={lessonIndex === index ? 'is-current' : ''} onClick={() => { setLessonIndex(index); setReviewMode(false); }}>{item.title}{progress.completedLessons.includes(`${module.id}:${index}`)&&<CheckCircle2 size={14}/>}</button>)}<button disabled={!allLessonsComplete} onClick={() => setReviewMode(true)}>Before You File This Away...</button></div></details></div>
    <div className="handbook-layout">
      <aside className="handbook-toc paper-card"><div className="eyebrow">Employee handbook</div><h2>{module.title}</h2><span className="tag">{module.level}</span><div className="handbook-toc-label">CONTENTS</div>{module.lessons.map((item, index) => <button key={item.title} className={`handbook-toc-link ${lessonIndex === index && !reviewMode ? 'is-current' : ''}`} onClick={() => { setLessonIndex(index); setReviewMode(false); }}><span>{progress.completedLessons.includes(`${module.id}:${index}`)?<CheckCircle2 size={15}/>:String(index + 1).padStart(2, '0')}</span>{item.title}</button>)}<button className={`handbook-toc-link handbook-review-link ${reviewMode ? 'is-current' : ''}`} disabled={!allLessonsComplete} onClick={() => setReviewMode(true)}><span><ClipboardCheck size={15}/></span>Before You File This Away...</button><Link href="/threat-intelligence" className="handbook-return"><ArrowLeft size={14}/> Archive</Link></aside>

      <article className="handbook-reading paper-card">
        {reviewMode ? <>
          <div className="eyebrow">Final review / File {module.number}</div><h1>Before You File This Away...</h1><p className="handbook-lead">Four questions to review the core ideas in this document. You need three correct to mark the file REVIEWED.</p>
          <div className="handbook-review-questions">{questions.map((item, index) => {const chosen = answers[index];const correct = chosen !== undefined && chosen === String(item.answer);return <fieldset className="handbook-question" key={item.prompt}><legend><span>{String(index + 1).padStart(2, '0')}</span>{item.prompt}</legend><div className="handbook-answer-options">{item.options.map((option, optionIndex) => <label key={option} className={((reviewSubmitted || chosen !== undefined) && optionIndex === item.answer) ? 'is-right-answer' : ''}><input type="radio" name={`review-${index}`} value={optionIndex} checked={chosen === String(optionIndex)} disabled={reviewSubmitted} onChange={() => setAnswers((old) => ({ ...old, [index]: String(optionIndex) }))}/>{option}</label>)}</div>{chosen !== undefined&&<p className={`handbook-answer-feedback ${correct?'is-correct':'is-wrong'}`}><b>{correct?'Correct.':'Not quite.'}</b> {item.explanation}</p>}</fieldset>;})}</div>
          {reviewSubmitted&&<div className={`handbook-review-result ${score >= 3?'passed':'retry'}`} role="status">{score >= 3 ? `Filed successfully: ${score} of 4 correct.` : `You got ${score} of 4. Review the notes and try again.`}</div>}
          <div className="handbook-lesson-actions"><button className="btn secondary" onClick={() => { setReviewMode(false); setReviewSubmitted(false); }}><ArrowLeft size={15}/> Back to lessons</button>{reviewSubmitted&&score<3?<button className="btn" onClick={() => { setAnswers({}); setReviewSubmitted(false); }}><RotateCcw size={15}/> Retry review</button>:!reviewSubmitted?<button className="btn" disabled={Object.keys(answers).length < questions.length} onClick={submitReview}>Submit review <ArrowRight size={15}/></button>:null}</div>
        </> : <>
          <div className="handbook-lesson-meta"><span className="eyebrow">Lesson {String(lessonIndex + 1).padStart(2, '0')} / {String(module.lessons.length).padStart(2, '0')}</span><span className="handbook-reading-time">{module.minutes} min total reading</span></div><h1>{lesson.title}</h1><p className="handbook-lead">{lesson.explanation}</p>
          <section className="handbook-content-section handbook-office-example"><span className="eyebrow">At the Scranton branch</span><p>{lesson.example}</p></section>
          <div className="handbook-key-takeaway"><span className="eyebrow">What to remember</span><p>{lesson.feedback}</p></div>
          <div className="handbook-lesson-actions"><button className="btn secondary" disabled={lessonIndex === 0} onClick={() => setLessonIndex((index) => index - 1)}><ArrowLeft size={15}/> Previous Lesson</button><button className={`btn ${progress.completedLessons.includes(`${module.id}:${lessonIndex}`)?'secondary':''}`} onClick={markComplete} disabled={progress.completedLessons.includes(`${module.id}:${lessonIndex}`)}>{progress.completedLessons.includes(`${module.id}:${lessonIndex}`)?<><CheckCircle2 size={15}/> Lesson Complete</>:<>Mark as Complete <Check size={15}/></>}</button>{lessonIndex < module.lessons.length - 1?<button className="btn secondary" onClick={() => setLessonIndex((index) => index + 1)}>Next Lesson <ArrowRight size={15}/></button>:<button className="btn" disabled={!allLessonsComplete} onClick={() => { setReviewMode(true); setReviewSubmitted(false); setAnswers({}); }}>Go to final review <ArrowRight size={15}/></button>}</div>
        </>}
      </article>

      <aside className="handbook-field-notes"><div className="handbook-field-note paper-card"><div className="eyebrow">{module.character}&apos;s note</div><p>“{module.characterNote}”</p></div><div className="handbook-field-note handbook-key-terms paper-card"><div className="eyebrow">Filed under</div>{module.topics.slice(0, 4).map((topic) => <span key={topic}>{topic}</span>)}</div><div className="handbook-field-note paper-card"><div className="eyebrow">File status</div><p>{progress.completedLessons.filter((id) => id.startsWith(`${module.id}:`)).length} of {module.lessons.length} lessons completed.</p>{progress.completedModules.includes(module.id)&&<span className="archive-reviewed">REVIEWED</span>}</div></aside>
    </div>
  </div></main>;
}
