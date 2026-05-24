import { Search } from "lucide-react";

function ClubCard({ club, onOpen }) {
  const clubId = club?.clubId ?? club?.id;
  const clubName = club?.clubName || "Club";

  return (
    <div
      onClick={() => clubId && onOpen(clubId)}
      className="group relative theme-bg-surface-muted border theme-border rounded-[2.5rem] overflow-hidden theme-hover-border transition-all duration-500 cursor-pointer"
    >
      <div className="h-32 theme-gradient-primary relative">
        <div className="absolute inset-0 theme-bg-overlay group-hover:bg-transparent transition-colors" />
        <div className="absolute -bottom-10 left-8">
          <div className="w-20 h-20 theme-bg-page rounded-[1.5rem] shadow-xl flex items-center justify-center text-2xl font-black theme-text border-4 theme-border group-hover:scale-110 transition-transform duration-500">
            {clubName.charAt(0)}
          </div>
        </div>
      </div>

      <div className="p-8 pt-14">
        <h3 className="text-2xl font-black theme-text mb-2 tracking-tight theme-group-hover-text-primary transition-colors">
          {clubName}
        </h3>
        <p className="theme-text-muted text-sm font-medium leading-relaxed mb-6 line-clamp-3">
          {club?.description || "Building community through shared interests and professional development at our university."}
        </p>

        <div className="flex items-center gap-4 pt-6 border-t theme-border">
          <div className="ml-auto w-10 h-10 rounded-full theme-bg-surface-strong flex items-center justify-center theme-text theme-hover-bg-primary theme-group-hover-text transition-all">
            <Search size={18} />
          </div>
        </div>
      </div>
    </div>
  );
}

export default ClubCard;
