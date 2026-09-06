import { useEffect, useState } from "react";
import { Save, Loader2 } from "lucide-react";
import { getMyClub, updateMyClub, updateMyClubBgImage } from "../api/clubService";
import {
  BackgroundImageDisplay,
  BackgroundImagePicker,
  BoardEditor,
  BoardReadOnly,
  ClubPageHeader,
  FormField,
} from "../components";
import { normalizeClubData } from "../lib/clubUtils";
import { hasRole } from "../../../shared/utils/roles";

const INITIAL_FORM = {
  vision: "",
  mission: "",
  description: "",
  executiveBoardJson: "[]",
  membersJson: "[]",
};

const makeId = () =>
  typeof crypto !== "undefined" && crypto.randomUUID
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(16).slice(2)}`;

const createBoardMember = (member = {}) => ({
  id: member.id || makeId(),
  position: member.position || "",
  name: member.name || "",
});

const createClubMember = (member = {}) => ({
  id: member.id || makeId(),
  role: member.role || "",
  name: member.name || "",
});

function ClubProfilePage() {
  const storedUser = localStorage.getItem("user");
  let parsedUser = null;
  if (storedUser) {
    try {
      parsedUser = JSON.parse(storedUser);
    } catch {
      parsedUser = null;
    }
  }
  const roles = parsedUser?.roles || [];
  const isSecretary = hasRole(roles, "ROLE_SECRETARY");

  const [form, setForm] = useState(INITIAL_FORM);
  const [boardMembers, setBoardMembers] = useState([createBoardMember()]);
  const [clubMembers, setClubMembers] = useState([createClubMember()]);
  const [currentClub, setCurrentClub] = useState(null);
  const [bgImageFile, setBgImageFile] = useState(null);
  const [bgImagePreview, setBgImagePreview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  useEffect(() => {
    if (!isSecretary) {
      setLoading(false);
      return;
    }

    const loadMyClub = async () => {
      setLoading(true);
      setError(null);

      try {
        const data = await getMyClub();
        const normalizedClub = normalizeClubData(data);

        setCurrentClub(normalizedClub);
        setForm(normalizedClub);
        setBoardMembers(
          normalizedClub.executiveBoard.length
            ? normalizedClub.executiveBoard.map((member) => createBoardMember(member))
            : [createBoardMember()]
        );
        setClubMembers(
          normalizedClub.members.length
            ? normalizedClub.members.map((member) => createClubMember(member))
            : [createClubMember()]
        );
      } catch (err) {
        console.error("Failed to load club profile:", err);
        setError("Failed to load your club profile.");
      } finally {
        setLoading(false);
      }
    };

    loadMyClub();
  }, [isSecretary]);

  useEffect(() => {
    return () => {
      if (bgImagePreview) {
        URL.revokeObjectURL(bgImagePreview);
      }
    };
  }, [bgImagePreview]);

  if (!isSecretary) {
    return (
      <div className="min-h-screen theme-bg-page theme-text p-6">
        <div className="max-w-4xl mx-auto rounded-2xl border theme-border-danger theme-bg-danger-soft p-6 theme-text-danger">
          This section is available only for ROLE_SECRETARY users.
        </div>
      </div>
    );
  }

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleBoardMemberChange = (index, field, value) => {
    setBoardMembers((prev) =>
      prev.map((member, i) => (i === index ? { ...member, [field]: value } : member))
    );
  };

  const addBoardMember = () => {
    setBoardMembers((prev) => [...prev, createBoardMember()]);
  };

  const removeBoardMember = (index) => {
    setBoardMembers((prev) => {
      if (prev.length === 1) return prev;
      return prev.filter((_, i) => i !== index);
    });
  };

  const handleClubMemberChange = (index, field, value) => {
    setClubMembers((prev) =>
      prev.map((member, i) => (i === index ? { ...member, [field]: value } : member))
    );
  };

  const addClubMember = () => {
    setClubMembers((prev) => [...prev, createClubMember()]);
  };

  const removeClubMember = (index) => {
    setClubMembers((prev) => {
      if (prev.length === 1) return prev;
      return prev.filter((_, i) => i !== index);
    });
  };

  const handleBgImageChange = (e) => {
    const file = e.target.files?.[0] || null;
    setBgImageFile(file);
    setBgImagePreview(file ? URL.createObjectURL(file) : null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess(null);

    try {
      const cleanedBoard = boardMembers
        .map((member) => ({
          position: (member.position || "").trim(),
          name: (member.name || "").trim(),
        }))
        .filter((member) => member.position || member.name);

      const executiveBoardJson = JSON.stringify(cleanedBoard);

      const cleanedMembers = clubMembers
        .map((member) => ({
          role: (member.role || "").trim(),
          name: (member.name || "").trim(),
        }))
        .filter((member) => member.role || member.name);

      const membersJson = JSON.stringify(cleanedMembers);

      const payload = {
        vision: (form.vision || "").trim() || currentClub?.vision || "",
        mission: (form.mission || "").trim() || currentClub?.mission || "",
        description: (form.description || "").trim() || currentClub?.description || "",
        executiveBoardJson,
        membersJson,
      };

      await updateMyClub(payload);

      if (bgImageFile) {
        const formData = new FormData();
        formData.append("bgImage", bgImageFile);
        await updateMyClubBgImage(formData);
      }

      const refreshed = await getMyClub();
      const normalizedClub = normalizeClubData(refreshed);
      setCurrentClub(normalizedClub);
      setForm(INITIAL_FORM);
      setBoardMembers([createBoardMember()]);
      setClubMembers([createClubMember()]);
      setBgImageFile(null);
      setBgImagePreview(null);

      setSuccess("Club profile updated successfully.");
    } catch (err) {
      console.error("Club profile update failed:", err);
      setError(err?.response?.data?.message || "Failed to update club profile.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen theme-bg-page theme-text p-6">
        <div className="max-w-4xl mx-auto rounded-2xl border theme-border theme-bg-surface p-6">
          Loading club profile...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen theme-bg-page theme-text p-6">
      <div className="max-w-4xl mx-auto">
        <ClubPageHeader
          title="My Club Profile"
          subtitle="Update vision, mission, executive board, and member details."
        />

        {currentClub && (
          <div className="rounded-3xl border theme-border theme-bg-surface overflow-hidden mb-6">
            <div className="px-6 md:px-8 py-4 border-b theme-border theme-bg-surface">
              <h2 className="text-sm font-black tracking-wider uppercase theme-text-muted">
                Current Saved Profile
              </h2>
            </div>
            <div className="p-6 md:p-8 space-y-5">
              <BackgroundImageDisplay imageUrl={currentClub.bgImageUrl} />

              <FormField label="Vision" value={currentClub.vision} readOnly rows={3} />
              <FormField label="Mission" value={currentClub.mission} readOnly rows={3} />
              <FormField label="Description" value={currentClub.description} readOnly rows={4} />
              <BoardReadOnly members={currentClub.executiveBoard || []} />
              <BoardReadOnly
                members={currentClub.members || []}
                title="Members"
                roleKey="role"
                emptyMessage="No members saved."
              />
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="rounded-3xl border theme-border theme-bg-surface overflow-hidden">
          <div className="px-6 md:px-8 py-4 border-b theme-border theme-bg-surface">
            <h2 className="text-sm font-black tracking-wider uppercase theme-text-muted">
              Update Profile
            </h2>
          </div>
          <div className="p-6 md:p-8 space-y-5">
            <FormField
              label="Vision"
              name="vision"
              value={form.vision}
              onChange={handleChange}
              rows={3}
            />

            <FormField
              label="Mission"
              name="mission"
              value={form.mission}
              onChange={handleChange}
              rows={3}
            />

            <FormField
              label="Description"
              name="description"
              value={form.description}
              onChange={handleChange}
              rows={4}
            />

            <BackgroundImagePicker onChange={handleBgImageChange} previewUrl={bgImagePreview} />

            <BoardEditor
              members={boardMembers}
              onMemberChange={handleBoardMemberChange}
              onAddMember={addBoardMember}
              onRemoveMember={removeBoardMember}
            />

            <BoardEditor
              members={clubMembers}
              onMemberChange={handleClubMemberChange}
              onAddMember={addClubMember}
              onRemoveMember={removeClubMember}
              title="Members"
              roleKey="role"
              rolePlaceholder="Role (e.g. Volunteer, free text)"
              namePlaceholder="Name (e.g. Nimal)"
              addLabel="Add Member"
            />

            {error && (
              <div className="rounded-xl border theme-border-danger theme-bg-danger-soft px-4 py-3 text-sm theme-text-danger">
                {error}
              </div>
            )}

            {success && (
              <div className="rounded-xl border theme-border-primary theme-bg-tint-strong px-4 py-3 text-sm theme-text-primary">
                {success}
              </div>
            )}
          </div>

          <div className="px-6 md:px-8 py-4 border-t theme-border theme-bg-surface flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center gap-2 rounded-xl theme-bg-primary theme-hover-bg-primary disabled:opacity-50 disabled:cursor-not-allowed px-5 py-2.5 text-sm font-bold theme-text-on-primary transition-colors"
            >
              {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
              {saving ? "Updating..." : "Update Club"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default ClubProfilePage;
