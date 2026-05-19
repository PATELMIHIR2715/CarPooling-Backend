export const INVALID_LOGIN_CREDENTIALS = "Invalid email or password";
export const EMAIL_ALREADY_EXISTS = "Email already in use";
export const NAME_TOO_SHORT = "Name must be at least 2 characters";
export const INVALID_EMAIL = "Invalid email address";
export const PASSWORD_TOO_SHORT = "Password must be at least 8 characters";
export const PASSWORD_WEAK =
  "Password must contain at least one uppercase letter and one special character";
export const ROLE_MISMATCH = "Role must be either DRIVER or PASSENGER";
export const PHONE_NUMBER_TOO_SHORT = "Phone number must be at least 10 digits";
export const NO_CARS_FOUND = "No cars found for this driver";
export const ALL_DOCUMENTS_REQUIRED = "Licence and RC documents are required";
export const DOCUMENTS_REQUIRED = "Documents are required";
export const NO_DOCUMENTS_FOUND = "No documents found for this driver";
export const CAR_ALREADY_EXISTS = "Car already exists for this driver";
export const OVERLAP_TRIP = "Overlapping trips found";
export const BOOKINGS_NOT_FOUND = "Bookings not found";
export const INVALID_STATUS = "Invalid status";
export const INVALID_QUERY = "Invalid query parameters";
export const REQUEST_FAILED = "Request failed";

// Prisma Error Messages
export const ALREADY_EXISTS = "Already exists";
export const RECORD_NOT_FOUND = "Record not found";
export const INVALID_REFERENCE = "Invalid reference";
export const INVALID_FIELD = "Invalid field";

// Auth Messages
export const INVALID_INPUT = "Invalid input";
export const UNAUTHORIZED = "Unauthorized";
export const FORBIDDEN = "Forbidden";
export const INVALID_REFRESH_TOKEN = "Invalid refresh token";
export const UNAUTHORIZED_ACCESS = "Unauthorized access";

// trip messages

export const TRIP_ALREADY_BOOKED = "You have already booked this trip";
export const NOT_ENOUGH_SEATS = "Not enough seats available";
export const TRIP_NOT_FOUND = "Trip not found";
export const PICKUP_DROPOFF_LOCATION_INVALID =
  "Pickup and dropoff locations cannot be the same";
export const PICKUP_DROPOFF_LOCATION_SAME =
  "Pickup and dropoff locations cannot be the same";
export const ROUTE_NOT_FOUND = "Route not found";
