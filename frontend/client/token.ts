export function setTokenCookie(token: string) {
  const expiry = new Date();
  expiry.setHours(expiry.getHours() + 24); // 1 jam
  document.cookie = `access_token=${token}; expires=${expiry.toUTCString()}; path=/`;
}

export function getTokenCookie(): string | null {
  const match = document.cookie.match(new RegExp('(^| )access_token=([^;]+)'));
  return match ? match[2] : null;
}

export function clearTokenCookie() {
  document.cookie = "access_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
}


