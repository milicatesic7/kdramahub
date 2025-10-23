using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace kdramahub_backend.Models
{
    public class Watch
    {
        [Key]
        public int Id { get; set; }

        [Required]
        public int UserId { get; set; }

        [Required]
        public int DramaId { get; set; }

        [ForeignKey("UserId")]
        public User User { get; set; }
    }
}
