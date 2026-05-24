import { Building2 } from "lucide-react";

function ClubPageHeader({ title, subtitle }) {
  return (
    <div className="mb-6 flex items-center gap-3">
      <div className="w-11 h-11 rounded-xl theme-bg-tint border theme-border-primary flex items-center justify-center theme-text-primary">
        <Building2 size={20} />
      </div>
      <div>
        <h1 className="text-2xl font-black theme-text">{title}</h1>
        <p className="text-sm theme-text-muted">{subtitle}</p>
      </div>
    </div>
  );
}

export default ClubPageHeader;
