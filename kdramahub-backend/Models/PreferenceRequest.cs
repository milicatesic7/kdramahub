namespace kdramahub_backend.Models
{
    public class PreferenceRequest
    {
        public string Genre { get; set; }      
        public string Length { get; set; }     
        public string Mood { get; set; }      
        public bool Gems { get; set; } = false;
    }
}
