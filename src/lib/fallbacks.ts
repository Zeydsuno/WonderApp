export function getFallbackImage(categoryName?: string): string {
  if (!categoryName) return "https://images.unsplash.com/photo-1527631746610-bca00a040d60?w=400&q=80"; // Default Travel

  const cat = categoryName.toLowerCase();

  if (cat.includes("cafe") || cat.includes("coffee") || cat.includes("tea")) {
    return "https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=400&q=80"; // Cafe
  }
  if (cat.includes("temple") || cat.includes("shrine") || cat.includes("religion")) {
    return "https://images.unsplash.com/photo-1527631746610-bca00a040d60?w=400&q=80"; // Default
  }
  if (cat.includes("restaurant") || cat.includes("food") || cat.includes("dining") || cat.includes("noodle") || cat.includes("kitchen")) {
    return "https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=400&q=80"; // Cafe/Food
  }
  if (cat.includes("market") || cat.includes("flea") || cat.includes("street food")) {
    return "https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=400&q=80"; // Cafe/Food
  }
  if (cat.includes("shop") || cat.includes("mall") || cat.includes("store")) {
    return "https://images.unsplash.com/photo-1527631746610-bca00a040d60?w=400&q=80"; // Default
  }
  if (cat.includes("bar") || cat.includes("pub") || cat.includes("night") || cat.includes("club")) {
    return "https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=400&q=80"; // Cafe/Food
  }
  if (cat.includes("park") || cat.includes("nature") || cat.includes("outdoor") || cat.includes("garden")) {
    return "https://images.unsplash.com/photo-1527631746610-bca00a040d60?w=400&q=80"; // Default
  }
  if (cat.includes("museum") || cat.includes("art") || cat.includes("culture") || cat.includes("history")) {
    return "https://images.unsplash.com/photo-1527631746610-bca00a040d60?w=400&q=80"; // Default
  }
  if (cat.includes("hotel") || cat.includes("resort") || cat.includes("lodging") || cat.includes("hostel")) {
    return "https://images.unsplash.com/photo-1527631746610-bca00a040d60?w=400&q=80"; // Default
  }

  return "https://images.unsplash.com/photo-1527631746610-bca00a040d60?w=400&q=80"; // Generic city
}
