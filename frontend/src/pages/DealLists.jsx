import { useDeals } from "../hooks/useDeals";
import { Plus, Search, Handshake } from "lucide-react";
import DealCard from "./components/DealCard";
import { useState } from "react";
import CustomDropdown2 from "./components/dropdown/CustomDropdown2";
import { useEffect } from "react";
import CreateDealModal from "./components/modal/CreatDealModal";

const ROLE_OPTIONS = [
  { label: "All Deals", value: "all" },
  { label: "Selling", value: "selling" },
  { label: "Buying", value: "buying" },
];
const STATUS_OPTIONS = [
  { label: "All Status", value: "all" },
  { label: "Active", value: "active" },
  { label: "Completed", value: "completed" },
];
const SORT_OPTIONS = [
  { label: "Recent", value: "recent" },
  { label: "Amount", value: "amount" },
  { label: "Deadline", value: "deadline" },
];
const DealLists = () => {
  const [page, setPage] = useState(1);
  const [role, setRole] = useState("all");
  const [status, setStatus] = useState("all");
  const [sort, setSort] = useState("recent");
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");

  const isFiltered = role != "all" || status != "all" || search != "";
  const clearFilter = () => {
    setRole("all");
    setStatus("all");
    setSort("recent");
    setSearchInput("");
    setSearch("");
    setPage(1);
  };
  // create button
  const [showCreate, setShowCreate] = useState(false);

  const { deals, totalPages, total, isLoading, isError } = useDeals({
    page,
    status,
    role,
    sort,
    search,
  });
  const start = total === 0 ? 0 : (page - 1) * 10 + 1;
  const end = Math.min(page * 10, total);

  useEffect(() => {
    const t = setTimeout(() => {
      setSearch(searchInput);
      setPage(1);
    }, 300);
    return () => clearTimeout(t);
  }, [searchInput]);
  // Loading state needed
  // Error state needed

  return (
    <div className="w-full max-w-6xl mx-auto p-4 pb-20 mt-10 md:mt-15">
      {/* Headers */}
      <div className="mt-8 mb-4 md:mt-0 flex items-center justify-between">
        <div>
          <p className="md:text-2xl text-xl font-semibold">Deals</p>
          <p className="text-gray-500 text-xs md:text-sm ">
            Escrow-protected deals you're buying or selling.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShowCreate(true)}
          className="flex items-center justify-center gap-2 bg-blue-700 hover:bg-blue-800 px-3 py-2 text-xs font-semibold text-white rounded-md cursor-pointer transition-all duration-200"
        >
          <Plus size={15} />
          <span>Create Deal</span>
        </button>
      </div>
      {/* Seach bar & Filters */}
      <div className="flex flex-col md:flex-row flex-wrap gap-2">
        <div className="relative min-w-0 flex-1 ">
          <Search
            size={16}
            className="text-gray-300 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
          />
          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="border border-gray-300 w-full bg-white text-gray-500 rounded-md text-xs p-2 pl-9 focus:outline-none focus:ring-1 focus:ring-gray-500"
            placeholder="Search by title or deal reference ..."
          ></input>
        </div>

        <div className="flex gap-2">
          <div className="w-28">
            <CustomDropdown2
              options={ROLE_OPTIONS}
              value={role}
              onChange={(v) => {
                setRole(v);
                setPage(1);
              }}
              placeholder="role"
            />
          </div>
          <div className="w-28">
            <CustomDropdown2
              options={STATUS_OPTIONS}
              value={status}
              onChange={(v) => {
                setStatus(v);
                setPage(1);
              }}
              placeholder="Status"
            />
          </div>
          <div className="w-28">
            <CustomDropdown2
              options={SORT_OPTIONS}
              value={sort}
              onChange={(v) => {
                setSort(v);
                setPage(1);
              }}
              placeholder="Sort"
            />
          </div>
        </div>
      </div>
      {isError ? (
        <p className="text-red-600 py-4">Failed to load deals.</p>
      ) : isLoading ? (
        <p className="text-gray-500 py-4 flex items-center justify-center">
          Loading deals…
        </p>
      ) : deals.length === 0 ? (
        isFiltered ? (
          <div className="flex flex-col items-center justify-center py-16">
            <h1>No deals match your filters</h1>
            <span className="text-gray-500 text-xs">
              Try a different status, or clear your search
            </span>
            <button
              type="button"
              onClick={clearFilter}
              className="flex items-center justify-center mt-4 gap-1 text-sm cursor-pointer text-blue-700 hover:text-blue-800 transition-all duration-200"
            >
              Clear filters
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-16">
            <Handshake className="text-blue-700 mt-4 mb-5" size={25} />
            <h1>No deals yet</h1>
            <span className="text-gray-500 text-xs leading-relaxed max-w-sm text-center">
              Create a deal, share the link with your buyer, and get paid safely.
            </span>
            <span className="text-gray-500 text-xs leading-relaxed max-w-sm text-center">
              The money stays in escrow until they confirm the item arrived.
            </span>
            
            <button
              type="button"
              onClick={() => setShowCreate(true)}
              className="flex items-center justify-center mt-8 gap-2 bg-blue-700 hover:bg-blue-800 px-3 py-2 text-xs md:text-sm font-semibold text-white rounded-md cursor-pointer transition-all duration-200"
            >
              <Plus size={18} />
              <span>Create your first deal</span>
            </button>
          </div>
        )
      ) : (
        <div className="flex flex-col gap-2 py-4">
          {deals.map((deal) => (
            <DealCard key={deal.deal_id} deal={deal} />
          ))}
        </div>
      )}

      {/* Page Navigation */}
      {total > 0 && (
        <>
          <div className="border-t border-gray-300 w-full mt-3 mb-2"></div>
          <div className="flex flex-wrap items-center justify-between">
            <span className="text-gray-500 text-[11px]">
              {`Showing ${start}-${end} of ${total}`}
            </span>
            {totalPages > 1 && (
              <div className="items-center flex gap-2 ">
                <button
                  onClick={() => setPage((p) => p - 1)}
                  disabled={page <= 1}
                  className="borde border-gray-300 text-[11px] text-gray-700  bg-white rounded-md px-3 py-1 cursor-pointer transition-all duration-200 enabled:hover:bg-gray-50 disabled:cursor-not-allowed disabled:text-gray-400"
                >
                  {`< Prev`}
                </button>
                <span className="text-[11px] text-gray-700 ">{`Page ${page} of ${totalPages}`}</span>
                <button
                  onClick={() => setPage((p) => p + 1)}
                  disabled={page >= totalPages}
                  className="border border-gray-300 text-[11px] text-gray-700  bg-white rounded-md px-3 py-1 cursor-pointer transition-all duration-200 enabled:hover:bg-gray-50 disabled:cursor-not-allowed disabled:text-gray-400"
                >
                  {`Next >`}
                </button>
              </div>
            )}
          </div>
        </>
      )}
      <CreateDealModal
        isOpen={showCreate}
        onClose={() => setShowCreate(false)}
      />
    </div>
  );
};
export default DealLists;
