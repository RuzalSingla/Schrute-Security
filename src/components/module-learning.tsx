'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { ArrowLeft, ArrowRight, CheckCircle2, CircleCheck } from 'lucide-react';
import { PageTitle } from '@/components/chrome';
import { currentRank, EMPTY_PROGRESS, loadProgress, saveProgress, trainingModules, XP_REWARDS, type TrainingProgress } from '@/lib/training';

export default function ModuleLearning({ moduleId }: { moduleId: string }) {
  const module = trainingModules.find((item) => item.id === moduleId);
  const [progress, setProgress] = useState<TrainingProgress>(EMPTY_PROGRESS);
  const [ready, setReady] = useState(false);
  const [lessonIndex, setLessonIndex] = useState(0);
  const [started, setStarted] = useState(false);
  const [selected, setSelected] = useState<number | null>(null);

  useEffect(() => { setProgress(loadProgress()); setReady(true); }, []);
  useEffect(() => { if (ready) saveProgress(progress); }, [progress, ready]);

  if (!module) return <main className="section"><div className="wrap"><PageTitle kicker="Training file not found" title="That file is missing" description="Choose an available training module from the employee program."/><Link className="btn" href="/threat-intelligence">Return to the training program</Link></div></main>;

  const lesson = module.lessons[lessonIndex];
  const lessonId = `${module.id}:${lessonIndex}`;
  const passed = progress.passedQuizzes.includes(lessonId);
  const completed = progress.completedLessons.includes(lessonId);
  const allModuleLessonsDone = module.lessons.every((_, index) => progress.completedLessons.includes(`${module.id}:${index}`) && progress.passedQuizzes.includes(`${module.id}:${index}`));
  const rank = currentRank(progress.xp);

  function finalizeModule(next: TrainingProgress): TrainingProgress {
    const complete = module!.lessons.every((_, index) => next.completedLessons.includes(`${module!.id}:${index}`) && next.passedQuizzes.includes(`${module!.id}:${index}`));
    if (!complete || next.completedModules.includes(module!.id)) return next;
    return { ...next, xp: next.xp + XP_REWARDS.module, completedModules: [...next.completedModules, module!.id] };
  }
  function completeLesson() {
    if (completed) return;
    setProgress((old) => finalizeModule({ ...old, xp: old.xp + XP_REWARDS.lesson, completedLessons: [...old.completedLessons, lessonId] }));
  }
  function passQuiz() {
    if (selected !== lesson.answer || passed) return;
    setProgress((old) => finalizeModule({ ...old, xp: old.xp + XP_REWARDS.quiz, passedQuizzes: [...old.passedQuizzes, lessonId] }));
  }

  if (!started) return <main className="section"><div className="wrap module-wrap"><Link className="module-back" href="/threat-intelligence"><ArrowLeft size={15}/> Training program</Link><section className="module-intro paper-card"><div className="module-intro-image"><Image src={module.image} alt={module.character} fill sizes="(max-width: 700px) 100vw, 340px" priority/></div><div className="module-intro-copy"><div className="eyebrow">Module {module.number} / {module.level} / {module.minutes} minutes</div><h1>{module.title}</h1><p className="module-intro-character">{module.character} has a note for the branch</p><p>{module.intro}</p><h2>What you&apos;ll learn</h2><ul>{module.topics.map((topic) => <li key={topic}><CheckCircle2 size={15}/>{topic}</li>)}</ul><div className="module-intro-actions"><button className="btn" onClick={() => setStarted(true)}>Start module <ArrowRight size={16}/></button><span>{module.lessons.length} lessons · {module.minutes} min</span></div></div></section></div></main>;

  if (allModuleLessonsDone) return <main className="section"><div className="wrap module-wrap"><Link className="module-back" href="/threat-intelligence"><ArrowLeft size={15}/> Training program</Link><section className="module-complete paper-card"><span className="module-complete-icon"><CircleCheck size={34}/></span><div className="eyebrow">Training file closed / Module {module.number}</div><h1>Branch security: improved.</h1><p>You completed all {module.lessons.length} lessons and knowledge checks in <b>{module.title}</b>.</p><div className="module-complete-stats"><span><b>{module.lessons.length}</b> lessons complete</span><span><b>{XP_REWARDS.lesson * module.lessons.length + XP_REWARDS.quiz * module.lessons.length + XP_REWARDS.module}</b> XP earned</span><span><b>{rank.current.name}</b> current rank</span></div><div className="module-complete-summary"><b>Concepts filed:</b> {module.topics.join(' · ')}</div><div className="module-intro-actions"><Link className="btn secondary" href="/threat-intelligence">Return to training program</Link>{trainingModules[trainingModules.findIndex((item) => item.id === module.id) + 1]&&<Link className="btn" href={`/threat-intelligence/module/${trainingModules[trainingModules.findIndex((item) => item.id === module.id) + 1].id}`}>Continue to next module <ArrowRight size={15}/></Link>}</div></section></div></main>;

  return <main className="section"><div className="wrap module-wrap"><Link className="module-back" href="/threat-intelligence"><ArrowLeft size={15}/> Training program</Link><div className="module-learning-layout"><aside className="module-lesson-nav paper-card"><div className="eyebrow">Module {module.number}</div><h2>{module.title}</h2>{module.lessons.map((item, index) => {const id = `${module.id}:${index}`;const done = progress.completedLessons.includes(id) && progress.passedQuizzes.includes(id);return <button className={`module-lesson-nav-item ${index === lessonIndex ? 'is-active' : ''}`} key={item.title} onClick={() => { setLessonIndex(index); setSelected(null); }}><span className="module-lesson-index">{done ? <CheckCircle2 size={16}/> : `0${index + 1}`}</span><span>{item.title}</span></button>;})}<div className="module-xp-card"><span className="eyebrow">Employee record</span><b>{progress.xp} XP</b><small>Rank: {rank.current.name}</small></div></aside>
      <article className="module-lesson-content paper-card"><div className="module-lesson-top"><span className="eyebrow">Lesson {lessonIndex + 1} of {module.lessons.length}</span><span className="tag">{module.level}</span></div><h1>{lesson.title}</h1><p className="module-explanation">{lesson.explanation}</p><div className="module-office-example"><span className="eyebrow">A branch example</span><p>{lesson.example}</p></div>
        <section className="module-knowledge-check"><div className="eyebrow">Knowledge check / +{XP_REWARDS.quiz} XP</div><h2>{lesson.question}</h2><div className="module-answer-list">{lesson.options.map((option, index) => <button key={option} disabled={passed} className={`module-answer ${selected === index ? 'is-selected' : ''} ${selected !== null && index === lesson.answer ? 'is-correct' : ''} ${selected === index && index !== lesson.answer ? 'is-incorrect' : ''}`} onClick={() => setSelected(index)}>{option}{selected !== null && index === lesson.answer&&<CheckCircle2 size={16}/>}</button>)}</div>
          {selected !== null&&<div className={`module-feedback ${selected === lesson.answer ? 'is-correct' : 'is-incorrect'}`} role="status"><b>{selected === lesson.answer ? 'Correct.' : 'Not quite.'}</b> {selected === lesson.answer ? lesson.feedback : `Review the key point: ${lesson.feedback}`}</div>}
          <div className="module-action-row"><button className="btn secondary small" onClick={completeLesson} disabled={completed}><CheckCircle2 size={15}/>{completed ? 'Lesson completed' : `Mark lesson complete (+${XP_REWARDS.lesson} XP)`}</button><button className="btn small" onClick={passQuiz} disabled={selected !== lesson.answer || passed}>{passed ? 'Knowledge check passed' : 'Submit answer'}</button></div>
        </section>
        <div className="module-navigation"><button className="btn secondary small" disabled={lessonIndex === 0} onClick={() => { setLessonIndex((index) => index - 1); setSelected(null); }}><ArrowLeft size={14}/> Previous lesson</button><span>{progress.completedLessons.filter((id) => id.startsWith(`${module.id}:`)).length}/{module.lessons.length} lessons recorded</span><button className="btn small" disabled={lessonIndex === module.lessons.length - 1} onClick={() => { setLessonIndex((index) => index + 1); setSelected(null); }}>Next lesson <ArrowRight size={14}/></button></div>
      </article></div>
    </div></main>;
}
