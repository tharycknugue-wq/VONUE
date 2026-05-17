import type { JobRole } from '../../services/api';

export const ROLE_LABEL: Record<JobRole, string> = {
  DJ: 'DJ',
  PHOTOGRAPHER: 'Fotógrafo',
  VIDEOGRAPHER: 'Videomaker',
  SOUND_TECH: 'Sonorização',
  LIGHT_TECH: 'Iluminação',
  BARTENDER: 'Bartender',
  SECURITY: 'Segurança',
  STRUCTURE: 'Montagem',
  FREELANCER: 'Freelancer',
};

export const ROLES: JobRole[] = [
  'BARTENDER',
  'SECURITY',
  'STRUCTURE',
  'SOUND_TECH',
  'LIGHT_TECH',
  'PHOTOGRAPHER',
  'VIDEOGRAPHER',
  'FREELANCER',
];
