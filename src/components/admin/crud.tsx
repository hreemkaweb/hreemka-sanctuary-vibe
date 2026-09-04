import { useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { productImageUrl } from "@/lib/shop";

export type Row = Record<string, unknown>;

export type FieldType =
  | "text"
  | "textarea"
  | "number"
  | "price"
  | "checkbox"
  | "date"
  | "datetime"
  | "select"
  | "image"
  | "images"
  | "tags";

export type Field = {
  key: string;
  label: string;
  type: FieldType;
  options?: string[];
  full?: boolean;
  slugFrom?: string;
};

export function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

/** Uploads to the shared media bucket and returns the stored path. */
export async function uploadMedia(file: File) {
  const ext = file.name.split(".").pop() ?? "jpg";
  const path = `${crypto.randomUUID()}.${ext}`;
  const { error } = await supabase.storage
    .from("product-images")
    .upload(path, file, { contentType: file.type, upsert: false });
  if (error) throw error;
  return path;
}

function toInput(type: FieldType, value: unknown) {
  if (value === null || value === undefined) return type === "checkbox" ? false : "";
  if (type === "price") return String((value as number) / 100);
  if (type === "datetime") return String(value).slice(0, 16);
  if (type === "date") return String(value).slice(0, 10);
  if (type === "tags" || type === "images") return (value as string[]) ?? [];
  return value as string | number | boolean;
}

function fromInput(type: FieldType, value: unknown) {
  if (type === "price") return Math.round(Number(value || 0) * 100);
  if (type === "number") return Math.round(Number(value || 0));
  if (type === "checkbox") return Boolean(value);
  if (type === "datetime" || type === "date")
    return value ? new Date(String(value)).toISOString() : null;
  if (type === "image") return value || null;
  return value;
}

const PAGE_SIZE = 12;

export function CrudManager({
  table,
  fields,
  defaults,
  titleKey,
  subtitle,
  searchKeys,
  orderBy = { column: "created_at", ascending: false },
  extraInvalidate = [],
  toggles = [],
  renderRowExtra,
}: {
  table: string;
  fields: Field[];
  defaults: Row;
  titleKey: string;
  subtitle?: (row: Row) => string;
  searchKeys: string[];
  orderBy?: { column: string; ascending: boolean };
  extraInvalidate?: string[];
  toggles?: { key: string; label: string }[];
  renderRowExtra?: (row: Row) => React.ReactNode;
}) {
  const queryClient = useQueryClient();
  const [draft, setDraft] = useState<Row | null>(null);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(0);

  const { data: rows = [], isLoading } = useQuery({
    queryKey: ["admin", table],
    queryFn: async () => {
      const { data, error } = await supabase
        .from(table as never)
        .select("*")
        .order(orderBy.column, { ascending: orderBy.ascending });
      if (error) throw error;
      return (data ?? []) as Row[];
    },
  });

  const refresh = async () => {
    await queryClient.invalidateQueries({ queryKey: ["admin", table] });
    for (const key of extraInvalidate) {
      await queryClient.invalidateQueries({ queryKey: [key] });
    }
  };

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter((row) =>
      searchKeys.some((k) =>
        String(row[k] ?? "")
          .toLowerCase()
          .includes(q),
      ),
    );
  }, [rows, search, searchKeys]);

  const pages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const visible = filtered.slice(page * PAGE_SIZE, page * PAGE_SIZE + PAGE_SIZE);

  const startEdit = (row: Row) => {
    const next: Row = { id: row["id"] };
    for (const f of fields) next[f.key] = toInput(f.type, row[f.key]);
    setDraft(next);
  };

  const save = async () => {
    if (!draft) return;
    setSaving(true);
    try {
      const payload: Row = {};
      for (const f of fields) payload[f.key] = fromInput(f.type, draft[f.key]);
      const id = draft["id"] as string | undefined;
      const { error } = id
        ? await supabase
            .from(table as never)
            .update(payload as never)
            .eq("id", id)
        : await supabase.from(table as never).insert(payload as never);
      if (error) throw error;
      toast.success(id ? "Saved" : "Created");
      setDraft(null);
      await refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not save");
    } finally {
      setSaving(false);
    }
  };

  const remove = async (row: Row) => {
    if (!window.confirm(`Delete "${String(row[titleKey])}"? This cannot be undone.`)) return;
    const { error } = await supabase
      .from(table as never)
      .delete()
      .eq("id", row["id"] as string);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Deleted");
    await refresh();
  };

  const duplicate = async (row: Row) => {
    const copy: Row = {};
    for (const f of fields) {
      copy[f.key] = f.key === "slug" ? `${String(row["slug"] ?? "copy")}-copy` : row[f.key];
    }
    if ("title" in copy) copy["title"] = `${String(copy["title"])} (copy)`;
    if ("name" in copy) copy["name"] = `${String(copy["name"])} (copy)`;
    const { error } = await supabase.from(table as never).insert(copy as never);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Duplicated");
    await refresh();
  };

  const patch = async (row: Row, values: Row) => {
    const { error } = await supabase
      .from(table as never)
      .update(values as never)
      .eq("id", row["id"] as string);
    if (error) {
      toast.error(error.message);
      return;
    }
    await refresh();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-3">
        <input
          className="glass-field max-w-xs flex-1"
          placeholder="Search…"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(0);
          }}
        />
        <span className="text-xs text-muted-foreground">{filtered.length} items</span>
        <button
          type="button"
          className="btn-sacred ml-auto"
          onClick={() => setDraft({ ...defaults })}
        >
          Add new
        </button>
      </div>

      {draft ? (
        <div className="liquid-glass card-liquid space-y-4 p-6">
          <h2 className="font-display text-2xl">{draft["id"] ? "Edit" : "New entry"}</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            {fields.map((f) => (
              <FieldInput key={f.key} field={f} draft={draft} setDraft={setDraft} />
            ))}
          </div>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={save}
              disabled={saving}
              className="btn-sacred disabled:opacity-60"
            >
              {saving ? "Saving…" : "Save"}
            </button>
            <button type="button" className="btn-ghost-sacred" onClick={() => setDraft(null)}>
              Cancel
            </button>
          </div>
        </div>
      ) : null}

      {isLoading ? <p className="text-sm text-muted-foreground">Loading…</p> : null}

      <div className="space-y-3">
        {visible.map((row) => (
          <article
            key={String(row["id"])}
            className="liquid-glass card-liquid flex flex-wrap items-center gap-4 p-5"
          >
            <Thumb row={row} />
            <div className="min-w-0 flex-1">
              <h3 className="truncate text-lg">{String(row[titleKey] ?? "Untitled")}</h3>
              <p className="truncate text-xs text-muted-foreground">
                {subtitle ? subtitle(row) : ""}
              </p>
            </div>
            {renderRowExtra?.(row)}
            {toggles.map((t) => (
              <button
                key={t.key}
                type="button"
                onClick={() => patch(row, { [t.key]: !row[t.key] })}
                className={`rounded-full border px-3 py-1 text-[0.65rem] tracking-[0.16em] uppercase ${
                  row[t.key] ? "border-gold text-gold" : "border-border text-muted-foreground"
                }`}
              >
                {t.label}
              </button>
            ))}
            <button
              type="button"
              onClick={() => startEdit(row)}
              className="text-xs tracking-[0.16em] uppercase text-primary"
            >
              Edit
            </button>
            <button
              type="button"
              onClick={() => duplicate(row)}
              className="text-xs tracking-[0.16em] uppercase text-muted-foreground hover:text-foreground"
            >
              Copy
            </button>
            <button
              type="button"
              onClick={() => remove(row)}
              className="text-xs tracking-[0.16em] uppercase text-muted-foreground hover:text-destructive"
            >
              Delete
            </button>
          </article>
        ))}
        {!isLoading && visible.length === 0 ? (
          <p className="text-sm text-muted-foreground">Nothing here yet.</p>
        ) : null}
      </div>

      {pages > 1 ? (
        <div className="flex items-center justify-center gap-4 text-xs tracking-[0.16em] uppercase">
          <button
            type="button"
            disabled={page === 0}
            onClick={() => setPage((p) => p - 1)}
            className="disabled:opacity-40"
          >
            Prev
          </button>
          <span className="text-muted-foreground">
            {page + 1} / {pages}
          </span>
          <button
            type="button"
            disabled={page >= pages - 1}
            onClick={() => setPage((p) => p + 1)}
            className="disabled:opacity-40"
          >
            Next
          </button>
        </div>
      ) : null}
    </div>
  );
}

function Thumb({ row }: { row: Row }) {
  const src =
    productImageUrl(
      (row["image_url"] as string) ??
        (row["banner_url"] as string) ??
        (row["cover_url"] as string) ??
        (row["photo_url"] as string) ??
        (row["images"] as string[] | undefined)?.[0] ??
        null,
    ) ?? null;
  if (!src) return null;
  return (
    <div className="h-14 w-14 shrink-0 overflow-hidden rounded-xl bg-secondary">
      <img src={src} alt="" loading="lazy" className="h-full w-full object-cover" />
    </div>
  );
}

function FieldInput({
  field,
  draft,
  setDraft,
}: {
  field: Field;
  draft: Row;
  setDraft: (row: Row) => void;
}) {
  const [uploading, setUploading] = useState(false);
  const value = draft[field.key];
  const set = (v: unknown) => setDraft({ ...draft, [field.key]: v });

  const wrap = (node: React.ReactNode) => (
    <label
      className={`block space-y-1.5 ${field.full || field.type === "textarea" ? "sm:col-span-2" : ""}`}
    >
      <span className="eyebrow">{field.label}</span>
      {node}
    </label>
  );

  if (field.type === "checkbox") {
    return (
      <label className="flex items-center gap-2 px-1 text-sm">
        <input
          type="checkbox"
          className="glass-check"
          checked={Boolean(value)}
          onChange={(e) => set(e.target.checked)}
        />
        {field.label}
      </label>
    );
  }

  if (field.type === "textarea") {
    return wrap(
      <textarea
        className="glass-field min-h-32"
        value={String(value ?? "")}
        onChange={(e) => set(e.target.value)}
      />,
    );
  }

  if (field.type === "select") {
    return wrap(
      <select
        className="glass-field"
        value={String(value ?? "")}
        onChange={(e) => set(e.target.value)}
      >
        {(field.options ?? []).map((o) => (
          <option key={o} value={o}>
            {o}
          </option>
        ))}
      </select>,
    );
  }

  if (field.type === "tags") {
    return wrap(
      <input
        className="glass-field"
        placeholder="Comma separated"
        value={((value as string[]) ?? []).join(", ")}
        onChange={(e) =>
          set(
            e.target.value
              .split(",")
              .map((t) => t.trim())
              .filter(Boolean),
          )
        }
      />,
    );
  }

  if (field.type === "image" || field.type === "images") {
    const list =
      field.type === "images" ? ((value as string[]) ?? []) : value ? [String(value)] : [];
    const upload = async (file: File) => {
      setUploading(true);
      try {
        const path = await uploadMedia(file);
        set(field.type === "images" ? [...list, path] : path);
        toast.success("Image uploaded");
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Upload failed");
      } finally {
        setUploading(false);
      }
    };
    return wrap(
      <div className="flex flex-wrap items-center gap-3">
        {list.map((img) => (
          <div key={img} className="relative h-20 w-20 overflow-hidden rounded-xl bg-secondary">
            <img src={productImageUrl(img) ?? ""} alt="" className="h-full w-full object-cover" />
            <button
              type="button"
              aria-label="Remove image"
              onClick={() => set(field.type === "images" ? list.filter((i) => i !== img) : null)}
              className="absolute top-1 right-1 rounded-full bg-background/80 px-1.5 text-xs"
            >
              ×
            </button>
          </div>
        ))}
        <span className="grid h-20 w-20 cursor-pointer place-content-center rounded-xl border border-dashed border-border text-xs text-muted-foreground">
          {uploading ? "…" : "Upload"}
          <input
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) void upload(file);
              e.target.value = "";
            }}
          />
        </span>
      </div>,
    );
  }

  const inputType =
    field.type === "date" ? "date" : field.type === "datetime" ? "datetime-local" : "text";

  return wrap(
    <input
      className="glass-field"
      type={inputType}
      inputMode={field.type === "number" || field.type === "price" ? "decimal" : undefined}
      value={String(value ?? "")}
      onChange={(e) => {
        const next = e.target.value;
        if (field.slugFrom) {
          setDraft({ ...draft, [field.key]: next, [field.slugFrom]: slugify(next) });
          return;
        }
        set(next);
      }}
    />,
  );
}
