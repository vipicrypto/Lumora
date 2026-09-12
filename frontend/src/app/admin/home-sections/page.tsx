"use client";

import {
  ChangeEvent,
  useEffect,
  useRef,
  useState,
} from "react";

type SectionKey = "recipient" | "occasion";

type HomeItem = {
  id: string;
  name: string;
  image: string;
};

type HomeSection = {
  id: string;
  key: SectionKey;
  title: string;
  subtitle: string;
  isActive: boolean;
  items: HomeItem[];
};

const fallbackSections: HomeSection[] = [
  {
    id: "recipient",
    key: "recipient",
    title: "Shop by Recipient",
    subtitle: "Curated for you",
    isActive: true,
    items: [
      {
        id: "recipient-1",
        name: "For Her",
        image: "",
      },
      {
        id: "recipient-2",
        name: "For Him",
        image: "",
      },
      {
        id: "recipient-3",
        name: "For Kids",
        image: "",
      },
      {
        id: "recipient-4",
        name: "Couples",
        image: "",
      },
      {
        id: "recipient-5",
        name: "Parents",
        image: "",
      },
      {
        id: "recipient-6",
        name: "Friends",
        image: "",
      },
    ],
  },
  {
    id: "occasion",
    key: "occasion",
    title: "Shop by Occasion",
    subtitle: "Make it special",
    isActive: true,
    items: [
      {
        id: "occasion-1",
        name: "Birthday",
        image: "",
      },
      {
        id: "occasion-2",
        name: "Anniversary",
        image: "",
      },
      {
        id: "occasion-3",
        name: "Wedding",
        image: "",
      },
      {
        id: "occasion-4",
        name: "Thank You",
        image: "",
      },
      {
        id: "occasion-5",
        name: "Just Because",
        image: "",
      },
      {
        id: "occasion-6",
        name: "Holiday",
        image: "",
      },
    ],
  },
];

export default function AdminHomeSectionsPage() {
  const [sections, setSections] =
    useState<HomeSection[]>(fallbackSections);

  const [loading, setLoading] =
    useState(true);

  const [savingSection, setSavingSection] =
    useState<string | null>(null);

  const [success, setSuccess] =
    useState("");

  const [error, setError] =
    useState("");

  const [uploadingItem, setUploadingItem] =
    useState<string | null>(null);

  const fileInputRefs = useRef<
    Record<string, HTMLInputElement | null>
  >({});

  /*
   * --------------------------------------------------------------------------
   * LOAD FROM DATABASE
   * --------------------------------------------------------------------------
   */

  useEffect(() => {
    let cancelled = false;

    async function loadSections() {
      try {
        setLoading(true);
        setError("");
        setSuccess("");

        const response = await fetch(
          "/api/admin/home-sections",
          {
            method: "GET",
            cache: "no-store",
          }
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.error ||
              "Unable to load home sections."
          );
        }

        if (
          !cancelled &&
          data.sections &&
          typeof data.sections === "object"
        ) {
          const recipient =
            data.sections.recipient;

          const occasion =
            data.sections.occasion;

          setSections([
            {
              id: recipient.id,
              key: "recipient",
              title: recipient.title || "",
              subtitle:
                recipient.subtitle || "",
              isActive:
                recipient.isActive !== false,
              items: Array.isArray(
                recipient.items
              )
                ? recipient.items
                : [],
            },
            {
              id: occasion.id,
              key: "occasion",
              title: occasion.title || "",
              subtitle:
                occasion.subtitle || "",
              isActive:
                occasion.isActive !== false,
              items: Array.isArray(
                occasion.items
              )
                ? occasion.items
                : [],
            },
          ]);
        }
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error
              ? err.message
              : "Unable to load home sections."
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadSections();

    return () => {
      cancelled = true;
    };
  }, []);

  /*
   * --------------------------------------------------------------------------
   * SECTION UPDATE
   * --------------------------------------------------------------------------
   */

  function updateSection(
    sectionId: HomeSection["id"],
    field:
      | "title"
      | "subtitle"
      | "isActive",
    value: string | boolean
  ) {
    setSections((current) =>
      current.map((section) =>
        section.id === sectionId
          ? {
              ...section,
              [field]: value,
            }
          : section
      )
    );
  }

  /*
   * --------------------------------------------------------------------------
   * ITEM NAME UPDATE
   * --------------------------------------------------------------------------
   */

  function updateItemName(
    sectionId: HomeSection["id"],
    itemId: string,
    value: string
  ) {
    setSections((current) =>
      current.map((section) =>
        section.id === sectionId
          ? {
              ...section,
              items: section.items.map(
                (item) =>
                  item.id === itemId
                    ? {
                        ...item,
                        name: value,
                      }
                    : item
              ),
            }
          : section
      )
    );
  }

  /*
   * --------------------------------------------------------------------------
   * ITEM IMAGE UPDATE
   * --------------------------------------------------------------------------
   */

  function updateItemImage(
    sectionId: HomeSection["id"],
    itemId: string,
    value: string
  ) {
    setSections((current) =>
      current.map((section) =>
        section.id === sectionId
          ? {
              ...section,
              items: section.items.map(
                (item) =>
                  item.id === itemId
                    ? {
                        ...item,
                        image: value,
                      }
                    : item
              ),
            }
          : section
      )
    );
  }

  /*
   * --------------------------------------------------------------------------
   * DELETE ITEM
   * --------------------------------------------------------------------------
   */

  function deleteItem(
    sectionId: HomeSection["id"],
    itemId: string
  ) {
    setSections((current) =>
      current.map((section) =>
        section.id === sectionId
          ? {
              ...section,
              items: section.items.filter(
                (item) => item.id !== itemId
              ),
            }
          : section
      )
    );
  }

  /*
   * --------------------------------------------------------------------------
   * ADD ITEM
   * --------------------------------------------------------------------------
   */

  function addItem(
    sectionId: HomeSection["id"]
  ) {
    setSections((current) =>
      current.map((section) => {
        if (section.id !== sectionId) {
          return section;
        }

        const newItem: HomeItem = {
          id: crypto.randomUUID(),
          name: "New Item",
          image: "",
        };

        return {
          ...section,
          items: [
            ...section.items,
            newItem,
          ],
        };
      })
    );
  }

  /*
   * --------------------------------------------------------------------------
   * FILE PICKER
   * --------------------------------------------------------------------------
   */

  function openFilePicker(
    itemId: string
  ) {
    fileInputRefs.current[
      itemId
    ]?.click();
  }

  /*
   * --------------------------------------------------------------------------
   * IMAGE UPLOAD
   * --------------------------------------------------------------------------
   */

  function handleImageUpload(
    event: ChangeEvent<HTMLInputElement>,
    sectionId: HomeSection["id"],
    itemId: string
  ) {
    const file =
      event.target.files?.[0];

    if (!file) {
      return;
    }

    setError("");
    setSuccess("");

    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/webp",
      "image/gif",
    ];

    if (!allowedTypes.includes(file.type)) {
      setError(
        "Please select a JPG, PNG, WEBP or GIF image."
      );

      event.target.value = "";
      return;
    }

    const maxSize =
      5 * 1024 * 1024;

    if (file.size > maxSize) {
      setError(
        "Image size must be 5 MB or less."
      );

      event.target.value = "";
      return;
    }

    const uploadKey =
      itemId || `${sectionId}-new`;

    setUploadingItem(uploadKey);

    const reader = new FileReader();

    reader.onload = () => {
      if (
        typeof reader.result ===
        "string"
      ) {
        updateItemImage(
          sectionId,
          itemId,
          reader.result
        );
      }

      setUploadingItem(null);
    };

    reader.onerror = () => {
      setError(
        "Unable to read the selected image."
      );

      setUploadingItem(null);
    };

    reader.readAsDataURL(file);

    event.target.value = "";
  }

  /*
   * --------------------------------------------------------------------------
   * SAVE SECTION
   * --------------------------------------------------------------------------
   */

  async function saveSection(
    section: HomeSection
  ) {
    try {
      setSavingSection(section.id);
      setSuccess("");
      setError("");

      const response = await fetch(
        "/api/admin/home-sections",
        {
          method: "PUT",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            section: section.key,

            title: section.title,

            subtitle:
              section.subtitle,

            isActive:
              section.isActive,

            items: section.items.map(
              (item, index) => ({
                id:
                  item.id ||
                  undefined,

                name: item.name,

                image:
                  item.image || null,

                sortOrder: index,

                isActive: true,
              })
            ),
          }),
        }
      );

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data.error ||
            data.details ||
            "Unable to save home section."
        );
      }

      /*
       * API returns:
       *
       * {
       *   success: true,
       *   section: updatedSection,
       *   items: updatedItems
       * }
       *
       * Rebuild the section in frontend
       * using the fresh database response.
       */

      if (data.section) {
        setSections((current) =>
          current.map(
            (currentSection) =>
              currentSection.id ===
              section.id
                ? {
                    id:
                      data.section.id,

                    key:
                      section.key,

                    title:
                      data.section.title,

                    subtitle:
                      data.section
                        .subtitle,

                    isActive:
                      data.section
                        .isActive,

                    items:
                      Array.isArray(
                        data.items
                      )
                        ? data.items
                        : section.items,
                  }
                : currentSection
          )
        );
      }

      setSuccess(
        `${section.title} saved successfully.`
      );
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to save home section."
      );
    } finally {
      setSavingSection(null);
    }
  }

  /*
   * --------------------------------------------------------------------------
   * UI
   * --------------------------------------------------------------------------
   */

  return (
    <div className="min-h-screen bg-neutral-50">
      <div className="mx-auto max-w-7xl px-5 py-8 sm:px-8 lg:px-10">

        {/* Header */}
        <div className="mb-8">
          <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.22em] text-neutral-400">
            Management
          </p>

          <h1 className="text-3xl font-semibold tracking-tight text-black">
            Manage Home Sections
          </h1>

          <p className="mt-2 max-w-xl text-sm leading-6 text-neutral-500">
            Update images and titles for
            your homepage sections.
          </p>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {/* Success */}
        {success && (
          <div className="mb-6 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
            {success}
          </div>
        )}

        {/* Loading */}
        {loading ? (
          <div className="rounded-2xl border border-neutral-200 bg-white px-6 py-10 text-center text-sm text-neutral-500">
            Loading home sections...
          </div>
        ) : (
          <div className="space-y-8">

            {sections.map(
              (section) => (
                <section
                  key={section.id}
                  className="overflow-hidden rounded-2xl border border-neutral-200 bg-white"
                >

                  {/* Section Header */}
                  <div className="border-b border-neutral-200 px-6 py-5">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

                      <div>
                        <h2 className="text-lg font-semibold text-black">
                          {section.title}
                        </h2>

                        <p className="mt-1 text-sm text-neutral-500">
                          Manage the items displayed in this homepage section.
                        </p>
                      </div>

                      <div className="flex items-center gap-3">

                        {/* Active / Inactive */}
                        <button
                          type="button"
                          onClick={() =>
                            updateSection(
                              section.id,
                              "isActive",
                              !section.isActive
                            )
                          }
                          className={`rounded-full px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.1em] ${
                            section.isActive
                              ? "bg-green-50 text-green-700 hover:bg-green-100"
                              : "bg-neutral-100 text-neutral-500 hover:bg-neutral-200"
                          }`}
                        >
                          {section.isActive
                            ? "Active"
                            : "Inactive"}
                        </button>

                        {/* Save */}
                        <button
                          type="button"
                          onClick={() =>
                            saveSection(
                              section
                            )
                          }
                          disabled={
                            savingSection ===
                            section.id
                          }
                          className="rounded-xl bg-black px-4 py-2.5 text-xs font-medium text-white transition hover:bg-neutral-800 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          {savingSection ===
                          section.id
                            ? "Saving..."
                            : "Save Changes"}
                        </button>

                      </div>
                    </div>
                  </div>

                  {/* Title + Subtitle */}
                  <div className="border-b border-neutral-100 px-6 py-6">
                    <div className="grid gap-5 md:grid-cols-2">

                      {/* Title */}
                      <div>
                        <label
                          htmlFor={`${section.id}-title`}
                          className="mb-2 block text-xs font-semibold uppercase tracking-[0.12em] text-neutral-500"
                        >
                          Section Title
                        </label>

                        <input
                          id={`${section.id}-title`}
                          type="text"
                          value={
                            section.title
                          }
                          onChange={(
                            event
                          ) =>
                            updateSection(
                              section.id,
                              "title",
                              event.target
                                .value
                            )
                          }
                          className="w-full rounded-xl border border-neutral-200 bg-white px-4 py-3 text-sm text-black outline-none focus:border-black"
                        />
                      </div>

                      {/* Subtitle */}
                      <div>
                        <label
                          htmlFor={`${section.id}-subtitle`}
                          className="mb-2 block text-xs font-semibold uppercase tracking-[0.12em] text-neutral-500"
                        >
                          Section Subtitle
                        </label>

                        <input
                          id={`${section.id}-subtitle`}
                          type="text"
                          value={
                            section.subtitle
                          }
                          onChange={(
                            event
                          ) =>
                            updateSection(
                              section.id,
                              "subtitle",
                              event.target
                                .value
                            )
                          }
                          className="w-full rounded-xl border border-neutral-200 bg-white px-4 py-3 text-sm text-black outline-none focus:border-black"
                        />
                      </div>

                    </div>
                  </div>

                  {/* Items */}
                  <div className="px-6 py-6">

                    <div className="mb-5 flex items-center justify-between">

                      <div>
                        <h3 className="text-sm font-semibold text-black">
                          Items
                        </h3>

                        <p className="mt-1 text-xs text-neutral-400">
                          Update the image and display name for each item.
                        </p>
                      </div>

                      <span className="text-xs font-medium text-neutral-400">
                        {
                          section.items
                            .length
                        }{" "}
                        items
                      </span>

                    </div>

                    <div className="space-y-3">

                      {section.items.map(
                        (
                          item,
                          index
                        ) => {
                          const inputKey =
                            item.id ||
                            `${section.id}-new-${index}`;

                          return (
                            <div
                              key={
                                inputKey
                              }
                              className="flex flex-col gap-4 rounded-xl border border-neutral-200 bg-neutral-50 p-4 md:flex-row md:items-center"
                            >

                              {/* Drag Handle */}
                              <div className="hidden shrink-0 cursor-grab text-neutral-300 md:block">
                                ⋮⋮
                              </div>

                              {/* Image Preview */}
                              <div className="h-20 w-20 shrink-0 overflow-hidden rounded-xl border border-neutral-200 bg-white">

                                {item.image ? (
                                  <img
                                    src={
                                      item.image
                                    }
                                    alt={
                                      item.name
                                    }
                                    className="h-full w-full object-cover"
                                  />
                                ) : (
                                  <div className="flex h-full w-full items-center justify-center text-2xl text-neutral-300">
                                    ◇
                                  </div>
                                )}

                              </div>

                              <div className="min-w-0 flex-1">

                                <p className="mb-3 text-[10px] font-semibold uppercase tracking-[0.12em] text-neutral-400">
                                  Item{" "}
                                  {index +
                                    1}
                                </p>

                                <div className="grid gap-3 md:grid-cols-2">

                                  {/* Name */}
                                  <div>
                                    <label
                                      htmlFor={`${inputKey}-name`}
                                      className="mb-1.5 block text-xs font-medium text-neutral-500"
                                    >
                                      Display Name
                                    </label>

                                    <input
                                      id={`${inputKey}-name`}
                                      type="text"
                                      value={
                                        item.name
                                      }
                                      onChange={(
                                        event
                                      ) =>
                                        updateItemName(
                                          section.id,
                                          item.id,
                                          event
                                            .target
                                            .value
                                        )
                                      }
                                      className="w-full rounded-lg border border-neutral-200 bg-white px-3 py-2.5 text-sm text-black outline-none focus:border-black"
                                    />
                                  </div>

                                  {/* Image URL */}
                                  <div>
                                    <label
                                      htmlFor={`${inputKey}-image`}
                                      className="mb-1.5 block text-xs font-medium text-neutral-500"
                                    >
                                      Image URL
                                    </label>

                                    <input
                                      id={`${inputKey}-image`}
                                      type="url"
                                      value={
                                        item.image.startsWith(
                                          "data:"
                                        )
                                          ? ""
                                          : item.image
                                      }
                                      onChange={(
                                        event
                                      ) =>
                                        updateItemImage(
                                          section.id,
                                          item.id,
                                          event
                                            .target
                                            .value
                                        )
                                      }
                                      placeholder="https://..."
                                      className="w-full rounded-lg border border-neutral-200 bg-white px-3 py-2.5 text-sm text-black outline-none focus:border-black"
                                    />
                                  </div>

                                </div>

                                {/* Upload */}
                                <div className="mt-3">

                                  <input
                                    ref={(
                                      element
                                    ) => {
                                      fileInputRefs.current[
                                        inputKey
                                      ] =
                                        element;
                                    }}
                                    type="file"
                                    accept="image/jpeg,image/png,image/webp,image/gif"
                                    className="hidden"
                                    onChange={(
                                      event
                                    ) =>
                                      handleImageUpload(
                                        event,
                                        section.id,
                                        item.id
                                      )
                                    }
                                  />

                                  <button
                                    type="button"
                                    onClick={() =>
                                      openFilePicker(
                                        inputKey
                                      )
                                    }
                                    disabled={
                                      uploadingItem ===
                                      inputKey
                                    }
                                    className="rounded-lg border border-neutral-300 bg-white px-3 py-2 text-xs font-medium text-neutral-700 hover:border-black hover:text-black disabled:opacity-50"
                                  >
                                    {uploadingItem ===
                                    inputKey
                                      ? "Loading..."
                                      : "Upload Image"}
                                  </button>

                                  <span className="ml-2 text-[11px] text-neutral-400">
                                    JPG, PNG,
                                    WEBP or GIF
                                    · Max 5 MB
                                  </span>

                                </div>

                              </div>

                              {/* Delete */}
                              <button
                                type="button"
                                onClick={() =>
                                  deleteItem(
                                    section.id,
                                    item.id
                                  )
                                }
                                className="shrink-0 rounded-lg border border-red-100 px-3 py-2 text-xs font-medium text-red-600 hover:bg-red-50"
                              >
                                Delete
                              </button>

                            </div>
                          );
                        }
                      )}

                    </div>

                    {/* Add Item */}
                    <button
                      type="button"
                      onClick={() =>
                        addItem(
                          section.id
                        )
                      }
                      className="mt-4 flex w-full items-center justify-center rounded-xl border border-dashed border-neutral-300 px-4 py-4 text-sm font-medium text-neutral-500 hover:border-black hover:bg-neutral-50 hover:text-black"
                    >
                      <span className="mr-2 text-base">
                        +
                      </span>
                      Add Item
                    </button>

                  </div>

                </section>
              )
            )}

          </div>
        )}

      </div>
    </div>
  );
}
