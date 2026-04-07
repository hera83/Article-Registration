using ArticleRegistration.Api.Data;
using ArticleRegistration.Api.Endpoints;
using ArticleRegistration.Api.Services;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);

var databaseDirectory = Path.Combine(builder.Environment.ContentRootPath, "App_Data");
Directory.CreateDirectory(databaseDirectory);

var connectionString = builder.Configuration.GetConnectionString("ArticleRegistration")
    ?? throw new InvalidOperationException("Connection string 'ArticleRegistration' is missing.");

builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseSqlite(connectionString));

builder.Services.AddCors(options =>
{
    options.AddPolicy("FrontendDev", policy =>
    {
        policy
            .WithOrigins(
                "http://localhost:5173",
                "http://127.0.0.1:5173",
                "https://localhost:5173",
                "https://127.0.0.1:5173")
            .AllowAnyHeader()
            .AllowAnyMethod();
    });
});

builder.Services.AddScoped<IArticleService, ArticleService>();
builder.Services.AddScoped<ILookupService, LookupService>();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var swaggerEnabled = builder.Configuration.GetValue<bool?>("Swagger:Enabled") ?? true;
var httpsRedirectionEnabled = builder.Configuration.GetValue<bool?>("HttpsRedirection:Enabled")
    ?? builder.Environment.IsDevelopment();

var app = builder.Build();

await app.ApplyDatabaseMigrationsAsync();

if (swaggerEnabled)
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseCors("FrontendDev");
if (httpsRedirectionEnabled)
{
    app.UseHttpsRedirection();
}

app.MapGet("/health", () => Results.Ok(new { status = "ok" }));
app.MapGet("/api/health", () => Results.Ok(new { status = "ok" }));
app.MapArticleEndpoints();
app.MapLookupEndpoints();

app.Logger.LogInformation("Startup environment: {EnvironmentName}", app.Environment.EnvironmentName);
app.Logger.LogInformation("Swagger enabled: {SwaggerEnabled}", swaggerEnabled);
app.Logger.LogInformation("Health endpoints: /health, /api/health");

app.Run();
