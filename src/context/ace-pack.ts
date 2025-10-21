export type AceBullet = { ts: string; who: 'agent' | 'operator'; text: string };
export type AcePack = { task: string; bullets: AceBullet[]; version: number };

export const makePack = (task: string): AcePack => ({ task, bullets: [], version: 1 });

export const addBullet = (pack: AcePack, who: AceBullet['who'], text: string): AcePack => ({
  ...pack,
  bullets: [...pack.bullets, { ts: new Date().toISOString(), who, text }],
  version: pack.version + 1,
});
