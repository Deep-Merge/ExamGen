import { Injectable, signal } from '@angular/core';
import { createSeed, SeedData } from '../data/seed';
import {
  Candidate,
  Exam,
  LiveMonitorCandidate,
  Question,
} from '../models';

@Injectable({ providedIn: 'root' })
export class DataService {
  private readonly seed: SeedData = createSeed();

  readonly exams = signal<Exam[]>([...this.seed.exams]);
  readonly questions = signal<Question[]>([...this.seed.questions]);
  readonly candidates = signal<Candidate[]>([...this.seed.candidates]);
  readonly liveCandidates = signal<LiveMonitorCandidate[]>([...this.seed.liveCandidates]);

  readonly organizations = this.seed.organizations;
  readonly users = this.seed.users;
  readonly sessions = this.seed.sessions;
  readonly results = this.seed.results;
  readonly activity = this.seed.activity;
  readonly notifications = this.seed.notifications;
  readonly kpis = this.seed.kpis;

  getExam(id: string): Exam | undefined {
    return this.exams().find((e) => e.id === id);
  }

  getQuestion(id: string): Question | undefined {
    return this.questions().find((q) => q.id === id);
  }

  upsertExam(exam: Exam): void {
    const list = [...this.exams()];
    const idx = list.findIndex((e) => e.id === exam.id);
    if (idx >= 0) list[idx] = exam;
    else list.unshift(exam);
    this.exams.set(list);
  }

  upsertQuestion(question: Question): void {
    const list = [...this.questions()];
    const idx = list.findIndex((q) => q.id === question.id);
    if (idx >= 0) list[idx] = question;
    else list.unshift(question);
    this.questions.set(list);
  }

  upsertCandidate(candidate: Candidate): void {
    const list = [...this.candidates()];
    const idx = list.findIndex((c) => c.id === candidate.id);
    if (idx >= 0) list[idx] = candidate;
    else list.unshift(candidate);
    this.candidates.set(list);
  }

  tickLiveMonitoring(): void {
    const states: LiveMonitorCandidate['state'][] = [
      'Online',
      'Online',
      'Online',
      'Warning',
      'Disconnected',
      'Suspicious',
    ];
    this.liveCandidates.update((rows) =>
      rows.map((row, i) => ({
        ...row,
        progress: Math.min(100, row.progress + (i % 3 === 0 ? 1 : 0)),
        timeRemainingMinutes: Math.max(0, row.timeRemainingMinutes - (i % 4 === 0 ? 1 : 0)),
        state: i % 7 === 0 ? states[(states.indexOf(row.state) + 1) % states.length] : row.state,
        lastActivity: i % 5 === 0 ? 'just now' : row.lastActivity,
      }))
    );
  }
}
