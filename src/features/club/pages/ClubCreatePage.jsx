import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Building2 } from "lucide-react";
import { createClub, getClubSecretaries } from "../../../shared/api/endpoints";

function ClubCreatePage() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    clubName: "",
    secretaryRegNumber: "",
  });
  const [loading, setLoading] = useState(false);
  const [secretaries, setSecretaries] = useState([]);
  const [loadingSecretaries, setLoadingSecretaries] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadSecretaries = async () => {
      setLoadingSecretaries(true);
      try {
        const data = await getClubSecretaries();
        const list = Array.isArray(data)
          ? data
          : Array.isArray(data?.data)
          ? data.data
          : [];
        setSecretaries(list);
      } catch (err) {
        console.error("Failed to load secretaries:", err);
        setError("Failed to load secretary list.");
        setSecretaries([]);
      } finally {
        setLoadingSecretaries(false);
      }
    };

    loadSecretaries();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await createClub({
        clubName: form.clubName,
        secretaryRegNumber: form.secretaryRegNumber,
      });
      navigate("/dashboard");
    } catch (err) {
      console.error("Club creation failed:", err);
      setError(
        err?.response?.data?.message || "Failed to create club. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen theme-bg-page p-8">
      <div className="max-w-lg mx-auto">

        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-black theme-text tracking-tight">
            Create New Club
          </h1>
          <p className="theme-text-muted text-sm mt-1">
            Register a new student club and assign its secretary
          </p>
        </div>

        {/* Form Card */}
        <form
          onSubmit={handleSubmit}
          className="theme-bg-page border theme-border rounded-2xl overflow-hidden"
        >
          <div className="p-6 space-y-5">
            <p className="text-[10px] font-black theme-text-soft uppercase tracking-widest">
              Club Details
            </p>

            {/* Club Name */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-black uppercase tracking-widest theme-text-muted">
                Club Name
              </label>
              <input
                name="clubName"
                value={form.clubName}
                onChange={handleChange}
                placeholder="e.g. ICTSC"
                required
                className="theme-bg-surface-muted border theme-border rounded-xl px-4 py-2.5 text-sm theme-text theme-placeholder focus:outline-none theme-focus-border transition-colors"
              />
            </div>

            {/* Secretary Reg Number */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-black uppercase tracking-widest theme-text-muted">
                Secretary
              </label>
              <select
                name="secretaryRegNumber"
                value={form.secretaryRegNumber}
                onChange={handleChange}
                required
                disabled={loadingSecretaries || secretaries.length === 0}
                className="theme-bg-surface-muted border theme-border rounded-xl px-4 py-2.5 text-sm theme-text focus:outline-none theme-focus-border transition-colors disabled:opacity-60"
              >
                <option value="">
                  {loadingSecretaries ? "Loading secretaries..." : "Select secretary"}
                </option>
                {secretaries.map((secretary, index) => {
                  const regNumber =
                    secretary?.regNumber ||
                    secretary?.registrationNumber ||
                    secretary?.regNo ||
                    "";
                  const name =
                    secretary?.name ||
                    secretary?.username ||
                    secretary?.fullName ||
                    "Secretary";
                  return (
                    <option
                      key={`${regNumber || "sec"}-${index}`}
                      value={regNumber}
                    >
                      {regNumber ? `${name} (${regNumber})` : name}
                    </option>
                  );
                })}
              </select>
              {!loadingSecretaries && secretaries.length === 0 && (
                <p className="text-xs theme-text-warning">
                  No secretaries available to assign right now.
                </p>
              )}
            </div>

            {/* Error Message */}
            {error && (
              <div className="theme-bg-danger-soft border theme-border-danger theme-text-danger text-xs font-semibold px-4 py-3 rounded-xl">
                {error}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex justify-end gap-3 px-6 py-4 border-t theme-border theme-bg-surface">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="px-5 py-2.5 rounded-xl border theme-border theme-text-muted theme-hover-text theme-hover-border text-sm font-bold transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || loadingSecretaries || secretaries.length === 0}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl theme-bg-primary theme-hover-bg-primary theme-text-on-primary text-sm font-bold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Building2 size={15} />
              {loading ? "Creating..." : "Create Club"}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}

export default ClubCreatePage;
