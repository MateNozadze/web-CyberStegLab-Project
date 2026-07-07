using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using FirebaseAdmin;
using Google.Apis.Auth.OAuth2;
using Google.Cloud.Firestore;
using CyberStegLab.API.Services;
using CyberStegLab.API.Services.Interfaces;
using CyberStegLab.API.Services.Implementation;
using CyberStegLab.API.Data;

var builder = WebApplication.CreateBuilder(args);


FirestoreDb db = await FirestoreInitializer.InitializeAsync(
    projectId: "cybersteglab",
    credentialPath: "Secrets/serviceAccountKey.json"
);

builder.Services.AddSingleton(db);

// Services
builder.Services.AddScoped<IAuthService, AuthService>();
builder.Services.AddScoped<IChallengeService, ChallengeService>();
builder.Services.AddScoped<IScoreService, ScoreService>();
builder.Services.AddScoped<IChallengeValidatorService, ChallengeValidatorService>();
builder.Services.AddScoped<IQuizService, QuizService>();
builder.Services.AddScoped<IAchievementService, AchievementService>();
builder.Services.AddScoped<IProgressService, ProgressService>();
builder.Services.AddScoped<ILessonService, LessonService>();

// JWT
var jwtKey = builder.Configuration["Jwt:Key"]!;
builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(opt =>
    {
        opt.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer           = true,
            ValidateAudience         = true,
            ValidateLifetime         = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer              = builder.Configuration["Jwt:Issuer"],
            ValidAudience            = builder.Configuration["Jwt:Audience"],
            IssuerSigningKey         = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtKey))
        };
    });

builder.Services.AddAuthorization();
builder.Services.AddControllers();
builder.Services.AddCors(opt =>
    opt.AddPolicy("AllowAll", p => p.AllowAnyOrigin().AllowAnyMethod().AllowAnyHeader())
);

var app = builder.Build();

app.UseHttpsRedirection();
app.UseStaticFiles();
app.UseCors("AllowAll");
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();
await ChallengeSeeder.SeedAsync(db);
await AchievementSeeder.SeedAsync(db);
await UserSeeder.SeedAsync(db);
app.Run();
