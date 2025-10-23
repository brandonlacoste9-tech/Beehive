export type CodexBadge = {
  id: string;
  label: string;
  issuedAt: string;
  status: 'minted' | 'revoked';
};

export function codexBadge(label = 'Grand Launch Badge'): CodexBadge {
  return {
    id: `badge-${Date.now()}`,
    label,
    issuedAt: new Date().toISOString(),
    status: 'minted',
  };
}
