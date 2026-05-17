import { logger } from '../lib/logger';
import { escrowAutoRelease } from './escrowAutoRelease';
import { locationCleanup } from './locationCleanup';
import { seloReconcile } from './seloReconcile';

interface JobDef {
  name: string;
  intervalMs: number;
  run: () => Promise<string>;
}

const MIN = 60_000;

const JOBS: JobDef[] = [
  { name: 'escrowAutoRelease', intervalMs: 15 * MIN, run: escrowAutoRelease },
  { name: 'locationCleanup', intervalMs: 30 * MIN, run: locationCleanup },
  { name: 'seloReconcile', intervalMs: 60 * MIN, run: seloReconcile },
];

let handles: NodeJS.Timeout[] = [];

async function exec(job: JobDef): Promise<void> {
  try {
    const result = await job.run();
    logger.info(`[job:${job.name}] ${result}`);
  } catch (e) {
    logger.warn(`[job:${job.name}] falhou: ${e instanceof Error ? e.message : e}`);
  }
}

export function startJobs(): void {
  if (process.env.NODE_ENV === 'test' || process.env.JOBS_ENABLED === 'false') {
    logger.info('⏱️  Jobs desativados (test/JOBS_ENABLED=false)');
    return;
  }

  JOBS.forEach((job, i) => {
    // Primeira execução escalonada após o boot (10s, 20s, 30s…).
    const kickoff = setTimeout(() => void exec(job), 10_000 * (i + 1));
    const interval = setInterval(() => void exec(job), job.intervalMs);
    kickoff.unref?.();
    interval.unref?.();
    handles.push(kickoff, interval);
  });

  logger.info(`⏱️  ${JOBS.length} jobs agendados`);
}

export function stopJobs(): void {
  for (const h of handles) {
    clearTimeout(h);
    clearInterval(h);
  }
  handles = [];
}
