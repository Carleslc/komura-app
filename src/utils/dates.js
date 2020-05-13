export function toISO(s) {
  return new Date(s).toISOString();
}

export function hoursElapsed(dt) {
  return -dt.diffNow('hours').toObject().hours;
}
