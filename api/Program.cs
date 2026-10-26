using System.Collections.Concurrent;

var builder = WebApplication.CreateBuilder(args);
var app = builder.Build();

var services = new[]
{
    new BookingService("consultation", "Discovery consultation", "Planning", 45, 0, "Talk through your goals and leave with a clear next step."),
    new BookingService("website-review", "Website review", "Design", 60, 75, "Get practical feedback on usability, accessibility, and conversion."),
    new BookingService("development-session", "Development session", "Engineering", 90, 150, "Make focused progress on a feature, bug, or technical question.")
};

var bookings = new ConcurrentDictionary<Guid, Booking>();
var bookingLock = new object();

app.MapGet("/api/health", () => Results.Ok(new { status = "ok" }));
app.MapGet("/api/services", () => Results.Ok(services));

app.MapGet("/api/availability", (string serviceId, DateOnly date) =>
{
    if (services.All(service => service.Id != serviceId))
        return Results.NotFound(new { message = "The selected service was not found." });

    var slots = new[] { "09:00", "10:30", "13:00", "14:30", "16:00" }
        .Where(time => !bookings.Values.Any(booking => booking.Date == date && booking.Time == time))
        .ToArray();

    return Results.Ok(new { date, slots });
});

app.MapPost("/api/bookings", (CreateBookingRequest request) =>
{
    var service = services.SingleOrDefault(item => item.Id == request.ServiceId);
    if (service is null)
        return Results.BadRequest(new { message = "Choose a valid service." });
    if (string.IsNullOrWhiteSpace(request.CustomerName) || string.IsNullOrWhiteSpace(request.Email))
        return Results.BadRequest(new { message = "Name and email are required." });
    if (request.Date < DateOnly.FromDateTime(DateTime.UtcNow))
        return Results.BadRequest(new { message = "Choose today or a future date." });
    if (request.Time is not ("09:00" or "10:30" or "13:00" or "14:30" or "16:00"))
        return Results.BadRequest(new { message = "Choose one of the available time slots." });

    lock (bookingLock)
    {
        if (bookings.Values.Any(booking => booking.Date == request.Date && booking.Time == request.Time))
            return Results.Conflict(new { message = "That time has just been booked. Please choose another slot." });

        var booking = new Booking(Guid.NewGuid(), service.Id, service.Name, request.CustomerName.Trim(), request.Email.Trim(), request.Date, request.Time, DateTimeOffset.UtcNow);
        bookings[booking.Id] = booking;
        return Results.Created($"/api/bookings/{booking.Id}", booking);
    }
});

app.MapGet("/api/admin/bookings", () => Results.Ok(bookings.Values.OrderBy(item => item.Date).ThenBy(item => item.Time)));

app.Run();

record BookingService(string Id, string Name, string Category, int DurationMinutes, decimal Price, string Description);
record CreateBookingRequest(string ServiceId, string CustomerName, string Email, DateOnly Date, string Time);
record Booking(Guid Id, string ServiceId, string ServiceName, string CustomerName, string Email, DateOnly Date, string Time, DateTimeOffset CreatedAt);
