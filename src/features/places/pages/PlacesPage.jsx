import { cloneElement, useState } from "react";
import { 
  MapPin, 
  Users, 
  Building2, 
  Search, 
  ChevronRight, 
  Filter,
  MoreVertical
} from "lucide-react";

const PlacesPage = () => {
  const [placesData] = useState([
    { placeId: 1, placeName: "Auditorium", department: "All", capacity: 450 },
    { placeId: 2, placeName: "Lab11", department: "ICT", capacity: 80 },
    { placeId: 3, placeName: "Lab12", department: "ICT", capacity: 110 },
    { placeId: 4, placeName: "NBLLT", department: "ET", capacity: 200 },
    { placeId: 5, placeName: "LH210", department: "ET", capacity: 500 },
    { placeId: 6, placeName: "BST12", department: "BST", capacity: 120 },
    { placeId: 7, placeName: "Ground", department: "All", capacity: null },
    { placeId: 8, placeName: "King Road", department: "All", capacity: null },
  ]);

  const [searchTerm, setSearchTerm] = useState("");

  const filteredPlaces = placesData.filter((p) =>
    p.placeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.department.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-8 theme-bg-page min-h-screen theme-text">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-black theme-text tracking-tight uppercase">
            Faculty Resources
          </h1>
          <p className="theme-text-muted text-sm mt-1 font-medium">
            Manage and monitor campus locations and capacities.
          </p>
        </div>

        <div className="relative group">
          <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none theme-text-muted theme-group-hover-text-primary transition-colors">
            <Search size={18} />
          </div>
          <input
            type="text"
            placeholder="Search venue or dept..."
            className="theme-bg-surface-muted border theme-border rounded-2xl py-3 pl-12 pr-6 w-full md:w-80 focus:outline-none focus:ring-2 theme-focus-ring theme-focus-border transition-all text-sm"
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <StatCard label="Total Venues" value={placesData.length} icon={<MapPin />} color="blue" />
        <StatCard label="Highest Capacity" value="500" icon={<Users />} color="emerald" />
        <StatCard label="Departments" value="4" icon={<Building2 />} color="amber" />
      </div>

      <div className="theme-bg-surface-muted border theme-border rounded-[2rem] overflow-hidden backdrop-blur-xl shadow-2xl">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b theme-border theme-bg-surface-muted">
              <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] theme-text-muted">ID</th>
              <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] theme-text-muted">Place Name</th>
              <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] theme-text-muted">Department</th>
              <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] theme-text-muted">Max Capacity</th>
            </tr>
          </thead>
          <tbody className="divide-y theme-divide">
            {filteredPlaces.map((place) => (
              <tr key={place.placeId} className="group theme-hover-bg transition-all duration-200">
                <td className="px-8 py-5 theme-text-muted font-mono text-xs">#{place.placeId}</td>
                <td className="px-8 py-5">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl theme-bg-tint-strong flex items-center justify-center theme-text-primary border theme-border-primary">
                      <MapPin size={18} />
                    </div>
                    <span className="font-bold theme-text text-sm tracking-wide">{place.placeName}</span>
                  </div>
                </td>
                <td className="px-8 py-5">
                  <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase border ${
                    place.department === 'All' 
                    ? 'theme-bg-surface-muted theme-border theme-text-muted'
                    : 'theme-bg-tint-strong theme-border-primary theme-text-primary'
                  }`}>
                    {place.department}
                  </span>
                </td>
                <td className="px-8 py-5">
                  <div className="flex items-center gap-2">
                    {place.capacity ? (
                      <>
                        <Users size={14} className="theme-text-soft" />
                        <span className="text-sm font-bold theme-text">{place.capacity}</span>
                      </>
                    ) : (
                      <span className="text-[10px] font-bold theme-text-soft uppercase tracking-widest">Outdoor/Unlimited</span>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        
        {filteredPlaces.length === 0 && (
          <div className="p-20 text-center">
            <p className="theme-text-muted font-bold uppercase tracking-[0.2em] text-xs">No matching venues found</p>
          </div>
        )}
      </div>
    </div>
  );
};

const StatCard = ({ label, value, icon, color }) => {
  const colors = {
    blue: "theme-bg-tint-strong theme-text-primary theme-border-primary",
    emerald: "theme-bg-tint-strong theme-text-primary theme-border-primary",
    amber: "theme-bg-warning-soft theme-text-warning theme-border-warning",
  };
  
  return (
    <div className="p-6 theme-bg-surface-muted border theme-border rounded-3xl flex items-center gap-5 transition-transform hover:-translate-y-1">
      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center border ${colors[color]}`}>
        {cloneElement(icon, { size: 24 })}
      </div>
      <div>
        <p className="text-[10px] font-black theme-text-muted uppercase tracking-widest mb-0.5">{label}</p>
        <p className="text-2xl font-black theme-text leading-none">{value}</p>
      </div>
    </div>
  );
};

export default PlacesPage;
