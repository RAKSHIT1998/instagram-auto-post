const WINDOWS = {
  instagram: { hour: 19, minute: 0 },
  facebook: { hour: 20, minute: 0 },
  linkedin: { hour: 9, minute: 0 },
  twitter: { hour: 12, minute: 0 }
};

export function predictBestTime(platform, fromDate = new Date()) {
  const target = WINDOWS[platform] || WINDOWS.twitter;
  const dt = new Date(fromDate);

  dt.setHours(target.hour, target.minute, 0, 0);

  if (dt <= fromDate) {
    dt.setDate(dt.getDate() + 1);
  }

  return dt;
}
