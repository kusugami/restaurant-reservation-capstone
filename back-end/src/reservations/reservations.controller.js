/**
 * List handler for reservation resources
 */
const service = require("./reservations.service");
const hasProperties = require("../errors/hasProperties");
const asyncErrorBoundary = require("../errors/asyncErrorBoundary");

const VALID_PROPERTIES = [
  "first_name",
  "last_name",
  "mobile_number",
  "reservation_date",
  "reservation_time",
  "people",
  "status",
  "reservation_id",
  "created_at",
  "updated_at",
];

const REQUIRED_PROPERTIES = [
  "first_name",
  "last_name",
  "mobile_number",
  "reservation_date",
  "reservation_time",
  "people",
];

const hasRequiredProperties = hasProperties(REQUIRED_PROPERTIES);

function hasOnlyValidProperties(req, res, next) {
  const { data } = req.body;
  if (!data) {
    return next({
      status: 400,
      message: `Missing Data`,
    });
  }

  const invalidFields = Object.keys(data).filter(
    (field) => !VALID_PROPERTIES.includes(field)
  );

  if (invalidFields.length) {
    return next({
      status: 400,
      message: `Invalid field(s): ${invalidFields.join(", ")}`,
    });
  }

  next();
}

function createValidation(req, res, next) {
  const errors = [];
  const { data = {} } = req.body;

  // ValidTime
  const resTime = data["reservation_time"];

  if (!/^(?:[0-1][0-9]|2[0-3]):[0-5][0-9](?::[0-5][0-9])?$/.test(resTime)) {
    next({
      status: 400,
      message: "Invalid reservation_time",
    });
  }

  if (resTime < "10:30" || resTime > "21:30") {
    return next({
      status: 400,
      message: "Reservation time should be in between 10:30 AM and 9:30 PM",
    });
  }

  // ValidDate
  const { data: { reservation_date } = {} } = req.body;
  const date = new Date(reservation_date);
  const today = new Date();
  const day = new Date(date).getUTCDay();

  console.log(
    "----------------------------------today date is-------------------------------",
    today
  );

  console.log(
    "--------------------------------date is---------------------------------------",
    date
  );

  if (isNaN(Date.parse(data["reservation_date"]))) {
    return next({
      status: 400,
      message: `Invalid reservation_date`,
    });
  }
  if (day === 2) {
    return next({
      status: 400,
      message: `Restaurant is closed on Tuesdays`,
    });
  }
  if (date.getTime() < today.getTime()) {
    return next({
      status: 400,
      message: "Current date must be in future",
    });
  }

  // ValidPeople
  const people = req.body.data.people;

  if (!people || typeof people !== "number" || people < 1) {
    errors.push("Invalid number of people. Must be a number greater than 0.");
  }

  // Valid Status

  if (errors.length) {
    return next({
      status: 400,
      message: errors.join(" "),
    });
  }

  next();
}

async function create(req, res) {
  const newReservation = req.body.data;
  const createdReservation = await service.create(newReservation);
  res.status(201).json({ data: createdReservation });
}

async function list(req, res) {
  const { date, mobile_number, reservation_id } = req.query;

  let data;
  if (reservation_id) {
    data = await service.getReservationById(reservation_id);
  } else if (date) {
    data = await service.searchByDate(date);
  } else if (mobile_number) {
    data = await service.searchByPhoneNumber(mobile_number);
  } else {
    data = await service.list();
  }

  res.json({ data });
}

function hasResId(req, res, next) {
  const reservation_id =
    req.params.reservation_id || req.body?.data?.reservation_id;

  if (reservation_id) {
    res.locals.reservation_id = reservation_id;
    next();
  } else {
    next({
      status: 400,
      message: `reservation_id is required`,
    });
  }
}
async function read(req, res) {
  res.json({ data: res.locals.reservation });
}

async function reservationExists(req, res, next) {
  const reservation_id = res.locals.reservation_id;
  const reservation = await service.read(reservation_id);
  if (reservation) {
    res.locals.reservation = reservation;
    next();
  } else {
    next({
      status: 404,
      message: `reservation Id ${reservation_id} dose not exist`,
    });
  }
}

async function reservationStatusCheck(req, res, next) {
  const { data } = req.body;
  if (data.status === "seated" || data.status === "finished") {
    next({
      status: 400,
      message: `reservation has a status of seated or finished.`,
    });
  }

  next();
}

async function hasValidStatus(req, res, next) {
  const { data } = req.body;
  if (
    data.status === "booked" ||
    data.status === "seated" ||
    data.status === "finished" ||
    data.status === "cancelled"
  ) {
    res.locals.status = data.status;
    return next();
  }
  next({
    status: 400,
    message: `invalid status ${data.status}`,
  });
}

function isNotFinished(req, res, next) {
  const table = res.locals.reservation;
  if (table.status === "finished") {
    return next({
      status: 400,
      message: `status of ${table.status} is finished`,
    });
  }
  next();
}

async function updateStatus(req, res) {
  const { reservation_id } = res.locals.reservation;
  const status = res.locals.status;
  const updatedReservation = await service.updateStatus(reservation_id, status);
  res.json({ data: updatedReservation });
}

async function updateReservation(req, res) {
  const reservation = {
    ...req.body.data,
    reservation_id: res.locals.reservation.reservation_id,
  };
  const updatedReservation = await service.updateReservation(reservation);
  res.json({ data: updatedReservation });
}

module.exports = {
  create: [
    hasRequiredProperties,
    hasOnlyValidProperties,
    createValidation,
    reservationStatusCheck,
    asyncErrorBoundary(create),
  ],
  list: [asyncErrorBoundary(list)],
  read: [
    hasResId,
    asyncErrorBoundary(reservationExists),
    asyncErrorBoundary(read),
  ],
  updateStatus: [
    hasResId,
    asyncErrorBoundary(reservationExists),
    isNotFinished,
    hasValidStatus,
    asyncErrorBoundary(updateStatus),
  ],
  resUpdate: [
    hasResId,
    asyncErrorBoundary(reservationExists),
    isNotFinished,
    hasRequiredProperties,
    hasOnlyValidProperties,
    createValidation,
    updateReservation,
  ],
};