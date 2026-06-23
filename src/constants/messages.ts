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
export const USER_NOT_FOUND = "User not found";
export const USERS_NOT_FOUND = "Users not found";
export const BOOKING_NOT_FOUND = "Booking not found";
export const CHAT_ACCESS_DENIED = "Chat not found or access denied";
export const BOOKING_ACCESS_DENIED = "You are not part of this booking";
export const ACCOUNT_RESTRICTED = "Account is restricted";
export const TOO_MANY_REQUESTS = "Too many requests, please try again later.";
export const SERVER_RUNNING = "Server running";
export const SUCCESS = "Success";
export const CORS_NOT_ALLOWED = "Not allowed by CORS";
export const SOCKET_SERVER_INITIALIZED = "Socket.io server initialized";
export const SOCKET_SERVER_NOT_INITIALIZED =
  "Socket.io server not initialized";
export const SOCKET_USER_CONNECTED = "User connected";
export const SOCKET_AUTH_TOKEN_MISSING =
  "Authentication error: No token provided";
export const SOCKET_AUTH_TOKEN_INVALID =
  "Authentication error: Invalid token";
export const FILE_TYPE_NOT_ALLOWED = "Only JPG, PNG and PDF files allowed";
export const INTERNAL_SERVER_ERROR = "Internal server error";
export const DATABASE_ERROR = "Database error";
export const INVALID_DATABASE_DATA = "Invalid data provided to database";
export const HTTP_ERROR_PREFIX = "HTTP Error:";

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
export const SEATS_AVAILABLE = "Seats are available, no need to join waitlist";
export const ALREADY_IN_WAITLIST = "Already in waitlist for this trip";
export const TRIP_NOT_COMPLETED = "Trip is not completed yet";
export const PASSRNGER_NOT_ASSOCIATED =
  "Passenger is not associated with this trip";

// Booking messages
export const BOOKING_ALREADY_CANCELLED = "Booking is already cancelled";
export const TRIP_COMPLETED = "Trip is already completed";
export const UNAUTHORIZED_CANCEL = "Unauthorized to cancel this booking";
export const TRIP_NOT_SCHEDULED = "Trip is not scheduled";
export const DOCUMENTS_NOT_APPROVED = "Your documents not approved";
export const DRIVER_CAR_NOT_FOUND = "Driver does not have a car registered";
export const OTP_SENT_SUCCESSFULLY = "OTP sent successfully";
export const INVALID_OTP = "Invalid OTP";
export const EMAIL_WORKER_STARTED = "Email worker started";
export const WAITLIST_CRON_STARTED = "Waitlist cron job started";
export const TRIP_CRON_STARTED = "Trip cron job started";
export const BOOKING_CRON_STARTED = "Booking cron job started";
export const TRIP_STATUS_CRON_UPDATED = "Trip status updated by cron job at";
export const BOOKING_CRON_CLEANED = "Booking entries cleaned up by cron job at";
export const WAITLIST_CRON_CLEANED =
  "Waitlist entries cleaned up by cron job at";
export const TRIP_CRON_ERROR = "Error starting trip cron job:";
export const BOOKING_CRON_ERROR = "Error starting booking cron job:";
export const WAITLIST_CRON_ERROR = "Error in waitlist cron job:";
export const EMAIL_JOB_COMPLETED = "Email job completed";
export const EMAIL_JOB_FAILED = "Email job failed";
export const EMAIL_JOB_COMPLETED_FOR = "Email job completed for";
export const EMAIL_SUBJECT_WELCOME = "Welcome to Carpooling App!";
export const EMAIL_SUBJECT_TRIP_STARTED = "Your Trip Has Started!";
export const EMAIL_SUBJECT_OTP = "Your OTP Code";
export const EMAIL_SUBJECT_BOOKING_REQUEST = "New Booking Request";
export const EMAIL_SUBJECT_BOOKING_CONFIRMED = "Booking Confirmed!";
export const EMAIL_SUBJECT_BOOKING_REJECTED = "Booking Rejected";
export const DATABASE_CONNECTED = "Database connected successfully!";
export const DATABASE_CONNECTION_FAILED = "Database connection failed:";
export const WEBHOOK_ERROR = "Webhook error:";

// Rating messages
export const RATING_ALREADY_SUBMITTED =
  "Rating already submitted for this trip";
export const PAYMENT_ALREADY_MADE = "Payment already made";
export const COD_PAYMENT_MODE = "Payment mode is cash on delivery";
export const INVALID_SIGNATURE = "Invalid signature";
export const INVALID_WEBHOOK_SIGNATURE = "Invalid webhook signature";
export const PAYMENT_VERIFIED_SUCCESSFULLY =
  "Payment verified successfully";
export const COD_REFUND_NOT_ALLOWED = "COD booking cannot be refunded online";
export const PAYMENT_NOT_MADE = "Payment not made";
export const PAYMENT_ID_NOT_FOUND = "Payment ID not found";
export const REFUND_INITIATED = "Refund initiated";
export const REFUND_TIMELINE = "5-7 business days";
export const BOOKING_CANCELLED_REASON = "Booking cancelled";
export const UNHANDLED_WEBHOOK_EVENT = "Unhandled webhook event";
export const DISPUTE_CREATED = "Dispute created for payment";
export const DISPUTE_WON = "Dispute won";
export const DISPUTE_ACTION_REQUIRED = "Dispute action required";
export const PAYMENT_DOWNTIME_STARTED = "Payment downtime started";
export const PAYMENT_DOWNTIME_RESOLVED = "Payment downtime resolved";
