export function getLabelFromName(name) {
  if (['tfn', 'acn', 'abn'].includes(name)) return name.toUpperCase();
  const s = name.replace(/([A-Z])/g, ' $1').trim();
  return s.charAt(0).toUpperCase() + s.slice(1);
}