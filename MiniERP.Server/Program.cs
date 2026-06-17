using System.Text;
using MiniERP.Server.Models;
using MiniERP.Server.Data;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using MiniERP.Server.Services;

namespace MiniERP.Server;

public class Program {
    public static void Main(string[] args) {
        var builder = WebApplication.CreateBuilder(args);

        var dbPassword = Environment.GetEnvironmentVariable("DB_PASSWORD");
        var monsterConn = builder.Configuration.GetConnectionString("DefaultConnection").Replace("${DB_PASSWORD}", dbPassword);
        builder.Services.AddDbContext<AppDbContext>(options => options.UseMySql(monsterConn, ServerVersion.AutoDetect(monsterConn)));
        builder.Services.AddIdentityCore<User>(options => {
            options.Password.RequireDigit = false;
            options.Password.RequiredLength = 4;
            options.Password.RequireNonAlphanumeric = false;
            options.Password.RequireUppercase = false;
            options.Password.RequireLowercase = false;
        })
        .AddRoles<IdentityRole>()
        .AddEntityFrameworkStores<AppDbContext>()
        .AddDefaultTokenProviders();

        var jwtSection = builder.Configuration.GetSection("Jwt");
        var jwtSecret = Environment.GetEnvironmentVariable("JWT_SECRET");
        var jwtKey = jwtSection["Key"]!.Replace("${JWT_SECRET}", jwtSecret);
        builder.Configuration["Jwt:Key"] = jwtKey;

        builder.Services.AddAuthentication(options => {
            options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
            options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
        })
        .AddJwtBearer(options => {
            options.TokenValidationParameters = new TokenValidationParameters {
                ValidateIssuer = true,
                ValidateAudience = true,
                ValidateLifetime = true,
                ValidateIssuerSigningKey = true,
                ValidIssuer = jwtSection["Issuer"],
                ValidAudience = jwtSection["Audience"],
                IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtKey)),
            };
        });
        builder.Services.AddAuthorization();

        builder.Services.AddScoped<JwtService>();
        builder.Services.AddScoped<ProductService>();
        builder.Services.AddScoped<OrderService>();
        builder.Services.AddScoped<InvoiceService>();
        builder.Services.AddScoped<CustomerService>();
        builder.Services.AddScoped<WarehouseService>();
        builder.Services.AddScoped<ReceiptService>();
        builder.Services.AddCors(options => {
            options.AddPolicy("AllowReact", policy => {
                policy.WithOrigins("https://localhost:5173", "https://myminierp.runasp.net")
                .AllowAnyHeader()
                .AllowAnyMethod()
                .AllowCredentials();
            });
        });
        builder.Services.AddControllers()
            .AddJsonOptions(options => {
                options.JsonSerializerOptions.ReferenceHandler =
                    System.Text.Json.Serialization.ReferenceHandler.IgnoreCycles;
                options.JsonSerializerOptions.PropertyNameCaseInsensitive = true;
            });

        builder.Services.AddOpenApi();

        var app = builder.Build();

        using (var scope = app.Services.CreateScope()) {
            var userManager = scope.ServiceProvider.GetRequiredService<UserManager<User>>();
            var context = scope.ServiceProvider.GetRequiredService<AppDbContext>();

            context.Database.EnsureCreated();

            var orderService = scope.ServiceProvider.GetRequiredService<OrderService>();
            orderService.SyncWarehouse();
        }

        app.UseDefaultFiles();
        app.UseStaticFiles(new StaticFileOptions {
            OnPrepareResponse = ctx => {
                var path = ctx.File.Name;

                if (path.EndsWith(".html")) {
                    // index.html se nikdy necachuje
                    ctx.Context.Response.Headers["Cache-Control"] = "no-cache, no-store, must-revalidate";
                    ctx.Context.Response.Headers["Pragma"] = "no-cache";
                    ctx.Context.Response.Headers["Expires"] = "0";
                } else {
                    // JS/CSS s hashem se cachují na 1 rok
                    ctx.Context.Response.Headers["Cache-Control"] = "public, max-age=31536000, immutable";
                }
            }
        });

        if (app.Environment.IsDevelopment()) {
            app.MapOpenApi();
        }

        app.UseHttpsRedirection();
        app.UseCors("AllowReact");
        app.UseAuthentication();
        app.UseAuthorization();
        app.MapControllers();
        app.MapFallbackToFile("/index.html");

        app.Run();
    }
}