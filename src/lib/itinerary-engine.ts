import { calculateDistance } from "./haversine";

export interface PlaceModel {
  id: string;
  lat: number;
  lng: number;
  estDuration: number;
  nameTh: string;
}

export interface SlotModel {
  placeId: string;
  startTime: string;
  endTime: string;
  transitMin: number;
}

/**
 * 1. Greedy TSP (Nearest Neighbor)
 * เรียงลำดับสถานที่ให้ระยะทางสั้นที่สุด โดยเริ่มจากจุดแรก
 */
export function greedyTSP(places: PlaceModel[], startPlace?: PlaceModel): PlaceModel[] {
  if (places.length <= 1) return places;
  
  const unvisited = [...places];
  const route: PlaceModel[] = [];
  
  // Start from provided startPlace or the first item
  let current = startPlace || unvisited.shift()!;
  if (startPlace) {
    const idx = unvisited.findIndex(p => p.id === startPlace.id);
    if (idx !== -1) unvisited.splice(idx, 1);
  }
  
  route.push(current);

  while (unvisited.length > 0) {
    let nearestIdx = 0;
    let minDistance = Infinity;

    for (let i = 0; i < unvisited.length; i++) {
      const dist = calculateDistance(current.lat, current.lng, unvisited[i].lat, unvisited[i].lng);
      if (dist < minDistance) {
        minDistance = dist;
        nearestIdx = i;
      }
    }

    current = unvisited[nearestIdx];
    route.push(current);
    unvisited.splice(nearestIdx, 1);
  }

  return route;
}

/**
 * 2. 0/1 Knapsack Problem
 * เลือกสถานที่ให้จำนวนมากที่สุด ภายใต้เวลาที่มีจำกัด (Time Budget เป็นนาที)
 * (ในที่นี้เราใช้ค่าความสุข (value) เท่ากันหมด เลยเปรียบเหมือนการพยายามยัดของให้ได้จำนวนชิ้นมากที่สุด)
 */
export function knapsackSelect(places: PlaceModel[], timeBudgetMin: number): PlaceModel[] {
  // เรียงสถานที่ตามระยะเวลาที่ใช้น้อยไปมาก เพื่อให้ยัดได้หลายที่ที่สุด
  const sorted = [...places].sort((a, b) => a.estDuration - b.estDuration);
  
  const selected: PlaceModel[] = [];
  let currentUsedTime = 0;

  for (const place of sorted) {
    // ประมาณการเวลาเดินทาง 15 นาที + เวลาใช้ในสถานที่
    const timeCost = place.estDuration + 15;
    if (currentUsedTime + timeCost <= timeBudgetMin) {
      selected.push(place);
      currentUsedTime += timeCost;
    }
  }

  return selected;
}

/**
 * 3. Build Timeline
 * คำนวณเวลาเริ่มและสิ้นสุด พร้อม transit time โดยใช้ Haversine (เฉลี่ยขับรถ 30 km/h)
 */
export function buildTimeline(orderedPlaces: PlaceModel[], startTime: string): SlotModel[] {
  const slots: SlotModel[] = [];
  
  // แปลง startTime เป็นนาที
  const [h, m] = startTime.split(":").map(Number);
  let currentMinutes = h * 60 + m;

  for (let i = 0; i < orderedPlaces.length; i++) {
    const place = orderedPlaces[i];
    let transitMin = 0;

    if (i > 0) {
      const prev = orderedPlaces[i - 1];
      const distKm = calculateDistance(prev.lat, prev.lng, place.lat, place.lng);
      // ความเร็ว 30 km/h => 1 km ใช้เวลา 2 นาที
      transitMin = Math.max(5, Math.round(distKm * 2)); 
    }

    currentMinutes += transitMin;
    const startMin = currentMinutes;
    const endMin = startMin + place.estDuration;
    currentMinutes = endMin;

    const formatTime = (totalMin: number) => {
      const hh = Math.floor(totalMin / 60) % 24;
      const mm = totalMin % 60;
      return `${hh.toString().padStart(2, '0')}:${mm.toString().padStart(2, '0')}`;
    };

    slots.push({
      placeId: place.id,
      startTime: formatTime(startMin),
      endTime: formatTime(endMin),
      transitMin
    });
  }

  return slots;
}
