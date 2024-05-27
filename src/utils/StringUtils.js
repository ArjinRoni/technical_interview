export function getInitials(name) {
  const names = name.split(' ').filter((name) => name.trim() !== '');
  const initials = names.map((name) => name.charAt(0).toUpperCase());
  return initials.join('');
}
