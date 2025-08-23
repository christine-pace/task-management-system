using Microsoft.EntityFrameworkCore;
using System;
using TaskManagementSystemBackend.Model;

namespace TaskManagementSystemBackend.Data
{
    public class AppDbContext: DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
        {
        }

        public DbSet<TaskItem> Tasks => Set<TaskItem>();
    }
}
