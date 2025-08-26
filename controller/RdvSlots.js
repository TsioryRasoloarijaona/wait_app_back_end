import { PrismaClient } from "../generated/prisma/index.js";
const prisma = new PrismaClient();

function getTomorrowDayName() {
  const days = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  return days[tomorrow.getDay()];
}

async function isOpenTomorrow(establishmentId) {
  const tomorrow = getTomorrowDayName();
  const est = await prisma.establishment.findFirst({
    where: {
      id: establishmentId,
      workingDetail: { some: { day: tomorrow } },
    },
  });
  return !!est;
}

async function getTomorrowWorkingDetails(establishmentId) {
  const tomorrow = getTomorrowDayName();

  const est = await prisma.establishment.findUnique({
    where: { id: establishmentId },
    select: {
      generalInfo: true,
      workingDetail: true,
    },
  });

  if (!est) return null;

  const tomorrowWindows = est.workingDetail.filter((w) => w.day === tomorrow);

  return {
    workingDetail: tomorrowWindows,
    duration: est.generalInfo.averageDuration,
  };
}

function makeSlots(openTime, closeTime, durationMin) {
  const duration = Number(durationMin);
  if (!duration || duration <= 0) return [];

  const start = toMinutes(openTime);
  const end = toMinutes(closeTime);
  if (end <= start) return [];

  const slots = [];
  for (let s = start; s + duration <= end; s += duration) {
    slots.push([fromMinutes(s), fromMinutes(s + duration)]);
  }
  return slots;
}

function toMinutes(input) {
  let s = String(input).trim().toLowerCase().replace(/\s+/g, "");
  let ampm = null;
  if (s.endsWith("am")) {
    ampm = "am";
    s = s.slice(0, -2);
  } else if (s.endsWith("pm")) {
    ampm = "pm";
    s = s.slice(0, -2);
  }

  s = s.replace(/h$/, "");
  let [hStr, mStr] = s.split(":");
  let h = parseInt(hStr, 10);
  let m = mStr ? parseInt(mStr, 10) : 0;

  if (
    Number.isNaN(h) ||
    Number.isNaN(m) ||
    h < 0 ||
    h > 23 ||
    m < 0 ||
    m > 59
  ) {
    throw new Error(`Heure invalide: "${input}"`);
  }

  if (ampm) {
    if (h === 12) h = 0;
    if (ampm === "pm") h += 12;
  }

  return h * 60 + m;
}

function fromMinutes(mins) {
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

//console.log(makeSlots('8:00' , '8:00pm' , 20))

export { isOpenTomorrow, getTomorrowWorkingDetails, makeSlots };
