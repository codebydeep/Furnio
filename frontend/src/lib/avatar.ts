/** Returns the letter used by default avatars when no profile image is set. */
export function getAvatarInitial(name?: string | null): string {
  return name?.trim().charAt(0).toUpperCase() || 'U'
}
