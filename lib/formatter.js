// Derives a display-friendly first name from an email's local part, since
// the users table only stores email — e.g. "ritchie.ngaro@x.com" -> "Ritchie".
export function firstNameFromEmail(email) {
  if (!email) return '';
  const local = email.split('@')[0];
  const firstPart = local.split(/[._-]/)[0];
  return firstPart.charAt(0).toUpperCase() + firstPart.slice(1);
}

export function initialFromEmail(email) {
  if (!email) return '?';
  return email.charAt(0).toUpperCase();
}
