const platformBuckets = new Map();

function nowSec() {
  return Math.floor(Date.now() / 1000);
}

export function allowPlatformRequest(platform, limit = 25, windowSec = 900) {
  const key = `${platform}:${Math.floor(nowSec() / windowSec)}`;
  const current = platformBuckets.get(key) || 0;

  if (current >= limit) {
    return false;
  }

  platformBuckets.set(key, current + 1);
  return true;
}
