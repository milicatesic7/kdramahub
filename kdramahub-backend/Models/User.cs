using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace kdramahub_backend.Models
{
    public class User
    {
        [Key]
        public int Id { get; set; }

        [Required]
        public string Name { get; set; }

        [Required, EmailAddress]
        public string Email { get; set; }

        [Required]
        public string Password { get; set; }

        public ICollection<Favorite> Favorites { get; set; } = new List<Favorite>();
        public ICollection<Watch> Watches { get; set; } = new List<Watch>();
    }
}

