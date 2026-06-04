using MiniERP.Server.Models;
using MiniERP.Server.Data;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Identity;

namespace MiniERP.Server;

public class Program {
    public static void Main(string[] args) {
        var builder = WebApplication.CreateBuilder(args);

        var dbPassword = Environment.GetEnvironmentVariable("DB_PASSWORD");
        var monsterConn = builder.Configuration.GetConnectionString("DefaultConnection").Replace("${DB_PASSWORD}", dbPassword);
        builder.Services.AddDbContext<AppDbContext>(options => options.UseMySql(monsterConn, ServerVersion.AutoDetect(monsterConn)));
        builder.Services.AddIdentity<User, IdentityRole>(options => {
            options.Password.RequireDigit = false;
            options.Password.RequiredLength = 4;
            options.Password.RequireNonAlphanumeric = false;
            options.Password.RequireUppercase = false;
            options.Password.RequireLowercase = false;
        })
        .AddEntityFrameworkStores<AppDbContext>()
        .AddDefaultTokenProviders();

        builder.Services.AddCors(options => {
            options.AddPolicy("AllowReact", policy => {
                policy.WithOrigins("https://localhost:5173", "https://myminierp.runasp.net/").AllowAnyHeader()
                      .AllowAnyMethod();
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

        }

        app.UseDefaultFiles();
        app.UseStaticFiles();

        if (app.Environment.IsDevelopment()) {
            app.MapOpenApi();
        }

        app.UseHttpsRedirection();
        app.UseCors("AllowReact");
        app.UseAuthorization();
        app.MapControllers();
        app.MapFallbackToFile("/index.html");

        app.Run();
    }
}