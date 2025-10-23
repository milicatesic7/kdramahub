using Microsoft.EntityFrameworkCore;
using kdramahub_backend.Models;

namespace kdramahub_backend.Data
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options)
            : base(options) { }

        public DbSet<User> Users { get; set; }
        public DbSet<Favorite> Favorites { get; set; }
        public DbSet<Watch> Watches { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            modelBuilder.Entity<Favorite>()
                .HasIndex(f => new { f.UserId, f.DramaId })
                .IsUnique();

            modelBuilder.Entity<Watch>()
                .HasIndex(w => new { w.UserId, w.DramaId })
                .IsUnique();
        }
    }
}
