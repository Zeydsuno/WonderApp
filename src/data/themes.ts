import { Place, places } from "./places";

export interface TripTheme {
  id: string;
  title: string;
  subtitle: string;
  emoji: string;
  coverImage: string;
  places: Place[];
}

export const tripThemes: TripTheme[] = [
  {
    id: "theme_temple",
    title: "ไหว้พระ 9 วัด",
    subtitle: "เสริมสิริมงคลรอบเกาะรัตนโกสินทร์",
    emoji: "🙏",
    coverImage: "https://images.unsplash.com/photo-1558913988-cb94ff217e94?w=400&q=80",
    places: places.filter(p => p.theme.includes("Culture")).slice(0, 5) // Use culture places
  },
  {
    id: "theme_cafe",
    title: "Cafe Hopping",
    subtitle: "จิบกาแฟ ถ่ายรูปคูลๆ",
    emoji: "☕",
    coverImage: "https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=400&q=80",
    places: places.filter(p => p.theme.includes("Cafe")).slice(0, 5)
  },
  {
    id: "theme_night",
    title: "ท่องราตรี",
    subtitle: "แสงสีและสตรีทฟู้ดยามค่ำคืน",
    emoji: "🌃",
    coverImage: "https://images.unsplash.com/photo-1519567241046-7f570eee3ce6?w=400&q=80",
    places: places.filter(p => p.theme.includes("Nightlife") || p.operatingHours.includes("24:00") || p.operatingHours.includes("02:00")).slice(0, 4)
  }
];
