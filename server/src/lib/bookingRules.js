/**
 * Règles métier de réservation du Centre de Beauté Loudaya.
 * Source de vérité unique, partagée par la validation API et le seed.
 */

export const OPEN_MINUTES = 10 * 60; // 10:00
export const CLOSE_MINUTES = 20 * 60; // 20:00
export const SLOT_STEP_MINUTES = 15; // granularité des créneaux
export const CLOSED_WEEKDAY = 0; // 0 = dimanche
export const BOOKING_WINDOW_DAYS = 90; // réservations autorisées à J+90

/**
 * Le salon est à Loudaya (Maroc) : UTC+1 en permanence.
 * Les dates sont stockées en @db.Date (UTC minuit) et les heures en "HH:MM"
 * locales du salon, d'où cet offset pour le contrôle « heure déjà passée ».
 */
export const SALON_UTC_OFFSET_MINUTES = 60;

/** "HH:MM" -> minutes depuis minuit */
export function timeToMinutes(time) {
  const [hours, minutes] = String(time).split(':').map(Number);
  if (!Number.isInteger(hours) || !Number.isInteger(minutes)) return NaN;
  return hours * 60 + minutes;
}

/** minutes depuis minuit -> "HH:MM" */
export function minutesToTime(totalMinutes) {
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
}

/** Tous les créneaux proposés entre l'ouverture et la fermeture. */
export function buildSlots() {
  const slots = [];
  for (let minutes = OPEN_MINUTES; minutes < CLOSE_MINUTES; minutes += SLOT_STEP_MINUTES) {
    slots.push(minutesToTime(minutes));
  }
  return slots;
}

/** Convertit "YYYY-MM-DD" en Date UTC à minuit (colonne @db.Date). */
export function parseBookingDate(dateString) {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(dateString));
  if (!match) return null;
  const [, year, month, day] = match.map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  if (
    date.getUTCFullYear() !== year ||
    date.getUTCMonth() !== month - 1 ||
    date.getUTCDate() !== day
  ) {
    return null;
  }
  return date;
}

/** Jour de la semaine UTC (0 = dimanche). */
export function weekdayOf(date) {
  return date.getUTCDay();
}

/** Convertit "60 min" / "1h30" en minutes. */
export function parseDurationToMinutes(duration) {
  const text = String(duration || '').trim();
  if (!text) return 0;
  const hours = /(\d+(?:[.,]\d+)?)\s*h/i.exec(text);
  const mins = /(\d+)\s*(?:min|m\b)/i.exec(text);
  let total = 0;
  if (hours) total += Math.round(parseFloat(hours[1].replace(',', '.')) * 60);
  if (mins) total += parseInt(mins[1], 10);
  if (!hours && !mins) {
    const bare = /(\d+)/.exec(text);
    if (bare) total = parseInt(bare[1], 10);
  }
  return total;
}

/** Deux créneaux [start, end) se chevauchent-ils ? */
export function overlaps(startA, endA, startB, endB) {
  return Math.max(startA, startB) < Math.min(endA, endB);
}

/**
 * Vérifie une date + heure demandées.
 * @returns {{ok: true, minutes: number} | {ok: false, code: string}}
 */
export function validateSlot({ date, time, durationMinutes }) {
  const dateObj = parseBookingDate(date);
  if (!dateObj) return { ok: false, code: 'INVALID_DATE' };

  const minutes = timeToMinutes(time);
  if (Number.isNaN(minutes)) return { ok: false, code: 'INVALID_TIME' };

  if (minutes % SLOT_STEP_MINUTES !== 0) return { ok: false, code: 'INVALID_TIME' };
  if (minutes < OPEN_MINUTES) return { ok: false, code: 'BEFORE_OPENING' };
  if (minutes >= CLOSE_MINUTES) return { ok: false, code: 'AFTER_CLOSING' };

  const duration = Math.max(Number(durationMinutes) || 0, SLOT_STEP_MINUTES);
  if (minutes + duration > CLOSE_MINUTES) return { ok: false, code: 'OVERRUNS_CLOSING' };

  if (weekdayOf(dateObj) === CLOSED_WEEKDAY) return { ok: false, code: 'SUNDAY_CLOSED' };

  const today = new Date();
  const todayUtc = Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate());
  if (dateObj.getTime() < todayUtc) return { ok: false, code: 'PAST_DATE' };
  if (dateObj.getTime() > todayUtc + BOOKING_WINDOW_DAYS * 86400000) {
    return { ok: false, code: 'DATE_TOO_FAR' };
  }

  // Dans la journée : impossible de réserver dans le passé (marge de 15 min)
  if (dateObj.getTime() === todayUtc) {
    const nowMinutes = today.getUTCHours() * 60 + today.getUTCMinutes() + SALON_UTC_OFFSET_MINUTES;
    if (minutes <= nowMinutes + SLOT_STEP_MINUTES) {
      return { ok: false, code: 'SLOT_PAST' };
    }
  }

  return { ok: true, minutes };
}