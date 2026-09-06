import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Building2, UserRound, FileText, Target, Rocket } from "lucide-react";
import { getClubs } from "../api/clubService";
import { ClubExecutiveBoardPanel } from "../components";
import { parseExecutiveBoard, parseMembers, resolveImageUrl } from "../lib/clubUtils";

function ClubDetailsPage() {
  const navigate = useNavigate();
  const { clubId } = useParams();

  const [club, setClub] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const normalizedId = useMemo(() => String(clubId || ""), [clubId]);
  const executiveBoardMembers = useMemo(
    () => parseExecutiveBoard(club?.executiveBoardJson ?? club?.executiveBoard),
    [club]
  );
  const clubMembers = useMemo(
    () => parseMembers(club?.membersJson ?? club?.members),
    [club]
  );

  useEffect(() => {
    const loadClub = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await getClubs();
        const list = Array.isArray(res) ? res : Array.isArray(res?.data) ? res.data : [];
        const match = list.find((item) => String(item?.clubId ?? item?.id) === normalizedId);

        if (!match) {
          setError("Club not found.");
          return;
        }
        setClub(match);
      } catch {
        setError("Failed to load club details.");
      } finally {
        setLoading(false);
      }
    };
    loadClub();
  }, [normalizedId]);

  return (
    <div className="min-h-screen theme-bg-page theme-text p-4 md:p-8">
      <div className="max-w-5xl mx-auto">
        {/* Navigation */}
        <button
          onClick={() => navigate(-1)}
          className="group flex items-center gap-2 text-sm font-bold theme-text-muted theme-hover-text-primary transition-all mb-8"
        >
          <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
          Back to Directory
        </button>

        {loading ? (
          <div className="animate-pulse space-y-4">
            <div className="h-48 theme-bg-page rounded-3xl" />
            <div className="h-24 theme-bg-page rounded-3xl" />
          </div>
        ) : error ? (
          <div className="p-8 rounded-3xl border theme-border-danger theme-bg-danger-soft theme-text-danger text-center font-bold">
            {error}
          </div>
        ) : (
          <div className="space-y-6">
            {/* --- Hero Header Card --- */}
            <div className="relative rounded-[2.5rem] border theme-border theme-bg-surface overflow-hidden shadow-2xl">
              <div className="h-48 theme-gradient-primary relative">
                {/* Visual Placeholder for bgImageUrl */}
                {resolveImageUrl(club.bgImageUrl || club.bgImagePath || club.backgroundImage) ? (
                  <img
                    src={resolveImageUrl(club.bgImageUrl || club.bgImagePath || club.backgroundImage)}
                    alt="Cover"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center opacity-10">
                     <Building2 size={120} />
                  </div>
                )}
              </div>

              <div className="px-8 pb-8 -mt-3 relative z-10">
                <div className="flex flex-col md:flex-row md:items-end gap-6">
                  <div className="w-24 h-24 rounded-3xl theme-bg-page border-4 theme-border flex items-center justify-center shadow-2xl theme-text-primary">
                    <Building2 size={40} />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <h1 className="text-4xl font-black theme-text tracking-tighter">{club.clubName}</h1>
                      <span className="px-3 py-1 rounded-full theme-bg-tint-strong border theme-border-primary theme-text-primary text-[10px] font-black uppercase tracking-widest">
                        Official Club
                      </span>
                    </div>
                    <p className="theme-text-muted font-medium mt-6"></p>
                  </div>
                </div>
              </div>
            </div>

            {/* --- Info Grid --- */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              
              {/* Main Content Column */}
              <div className="md:col-span-2 space-y-6">
                {/* Vision & Mission Sections */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="p-6 rounded-3xl border theme-border theme-bg-surface theme-hover-border-primary transition-colors">
                    <div className="w-10 h-10 rounded-xl theme-bg-tint-strong flex items-center justify-center theme-text-primary mb-4">
                      <Target size={20} />
                    </div>
                    <h3 className="text-lg font-bold theme-text mb-2">Our Vision</h3>
                    <p className="text-sm theme-text-muted leading-relaxed">
                      {club.vision || "To inspire and lead the next generation of innovators within our university community."}
                    </p>
                  </div>

                  <div className="p-6 rounded-3xl border theme-border theme-bg-surface theme-hover-border-primary transition-colors">
                    <div className="w-10 h-10 rounded-xl theme-bg-tint-strong flex items-center justify-center theme-text-primary mb-4">
                      <Rocket size={20} />
                    </div>
                    <h3 className="text-lg font-bold theme-text mb-2">Our Mission</h3>
                    <p className="text-sm theme-text-muted leading-relaxed">
                      {club.mission || "Providing a platform for students to collaborate, learn, and excel in their respective fields."}
                    </p>
                  </div>
                </div>

                {/* About Section */}
                <div className="p-8 rounded-3xl border theme-border theme-bg-surface">
                  <h3 className="flex items-center gap-2 text-xl font-bold theme-text mb-4">
                    <FileText size={20} className="theme-text-primary" />
                    About the Organization
                  </h3>
                  <p className="theme-text-muted leading-relaxed italic">
                    {club.description || "Information technology and communication are at the heart of modern innovation. ICTSC serves as the hub for tech enthusiasts to explore beyond the classroom."}
                  </p>
                </div>
              </div>

              {/* Sidebar Column */}
              <div className="space-y-6">
                {/* Executive Board Placeholder */}
                <ClubExecutiveBoardPanel members={executiveBoardMembers} />
                <ClubExecutiveBoardPanel
                  members={clubMembers}
                  title="Members"
                  roleKey="role"
                  emptyMessage="No members have been added yet."
                />
              </div>

            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default ClubDetailsPage;
