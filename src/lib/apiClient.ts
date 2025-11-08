export type Election = {
  id: string;
  title: string;
  startsAt?: string;
  endsAt?: string;
  options: string[];
  status: 'draft'|'open'|'closed';
};