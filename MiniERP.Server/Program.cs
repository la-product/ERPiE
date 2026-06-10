using MiniERP.Server.Models;
using MiniERP.Server.Data;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Identity;
using MiniERP.Server.Services;

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

        builder.Services.AddScoped<ProductService>();
        builder.Services.AddScoped<OrderService>();
        builder.Services.AddScoped<InvoiceService>();
        builder.Services.AddScoped<CustomerService>();
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
        app.UseStaticFiles(new StaticFileOptions {
            OnPrepareResponse = ctx =>
            {
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
        app.UseAuthorization();
        app.MapControllers();
        app.MapFallbackToFile("/index.html");

        app.Run();
    }
}