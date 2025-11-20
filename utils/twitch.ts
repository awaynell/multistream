/**
 * Извлекает username из Twitch URL или возвращает сам username
 * @param input - URL или username
 * @returns username или null если невалидный формат
 */
export function parseTwitchInput(input: string): string | null {
  if (!input || typeof input !== 'string') {
    return null
  }

  const trimmed = input.trim()

  // Если это URL
  if (trimmed.includes('twitch.tv/')) {
    const urlPattern = /(?:https?:\/\/)?(?:www\.)?twitch\.tv\/([a-zA-Z0-9_]+)/i
    const match = trimmed.match(urlPattern)
    if (match && match[1]) {
      return match[1].toLowerCase()
    }
    return null
  }

  // Если это просто username (только буквы, цифры, подчеркивания)
  const usernamePattern = /^[a-zA-Z0-9_]{1,25}$/
  if (usernamePattern.test(trimmed)) {
    return trimmed.toLowerCase()
  }

  return null
}

/**
 * Генерирует URL для Twitch embed player
 * @param username - Twitch username
 * @param parent - домен родительской страницы (для безопасности)
 * @returns URL для iframe
 */
export function getTwitchEmbedUrl(username: string, parent?: string): string {
  // Если parent не передан, используем значение по умолчанию
  // Вызывающий код должен передавать parent из useEffect
  const parentDomain = parent || 'localhost'
  const params = new URLSearchParams({
    channel: username,
    parent: parentDomain,
    autoplay: 'true',
    muted: 'false',
  })
  return `https://player.twitch.tv/?${params.toString()}`
}

