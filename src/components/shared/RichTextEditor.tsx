"use client";

import { useEffect, useRef } from "react";

type RichTextEditorProps = {
  name: string;
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
  minHeight?: number;
};

export function RichTextEditor({
  name,
  value,
  onChange,
  placeholder,
  minHeight = 220,
}: RichTextEditorProps) {
  const editorRef = useRef<HTMLDivElement | null>(null);

  const applyListStyling = (root: HTMLElement) => {
    const uls = root.querySelectorAll("ul");
    const ols = root.querySelectorAll("ol");

    uls.forEach((ul) => {
      ul.classList.add("list-disc", "pl-5", "mb-2");
    });
    ols.forEach((ol) => {
      ol.classList.add("list-decimal", "pl-5", "mb-2");
    });
  };

  useEffect(() => {
    const el = editorRef.current;
    if (!el) return;
    if (el.innerHTML !== value) {
      el.innerHTML = value || "";
      applyListStyling(el);
    }
  }, [value]);

  const exec = (command: string, arg?: string) => {
    if (typeof document === "undefined") return;
    editorRef.current?.focus();
    // eslint-disable-next-line deprecation/deprecation
    document.execCommand(command, false, arg);
  };

  const insertTable = () => {
    const rows = Number(prompt("Number of rows?", "2") || "2");
    const cols = Number(prompt("Number of columns?", "2") || "2");
    if (!rows || !cols) return;
    const cells = Array.from({ length: cols })
      .map(
        () => '<td style="border:1px solid #e5e7eb;padding:4px 8px;">Cell</td>'
      )
      .join("");
    const rowsHtml = Array.from({ length: rows })
      .map(() => `<tr>${cells}</tr>`)
      .join("");
    const html = `<table style="border-collapse:collapse;width:100%;border:1px solid #e5e7eb;">${rowsHtml}</table>`;
    exec("insertHTML", html);
  };

  const insertImage = () => {
    const url = prompt("Image URL");
    if (!url) return;
    exec(
      "insertHTML",
      `<img src="${url}" alt="" style="max-width:100%;height:auto;" />`
    );
  };

  const insertLink = () => {
    const url = prompt("Link URL");
    if (!url) return;
    exec("createLink", url);
  };

  return (
    <div className="border border-gray-300 rounded-lg overflow-hidden bg-white">
      <div className="flex flex-wrap gap-1 border-b border-gray-200 bg-gray-50 px-2 py-1.5 text-xs">
        <button
          type="button"
          onClick={() => exec("bold")}
          className="px-2 py-1 rounded hover:bg-gray-200 font-semibold"
        >
          B
        </button>
        <button
          type="button"
          onClick={() => exec("italic")}
          className="px-2 py-1 rounded hover:bg-gray-200 italic"
        >
          I
        </button>
        <button
          type="button"
          onClick={() => exec("underline")}
          className="px-2 py-1 rounded hover:bg-gray-200 underline"
        >
          U
        </button>
        <span className="h-4 w-px bg-gray-300 mx-1" />
        <button
          type="button"
          onClick={() => exec("formatBlock", "<h2>")}
          className="px-2 py-1 rounded hover:bg-gray-200"
        >
          H2
        </button>
        <button
          type="button"
          onClick={() => exec("formatBlock", "<h3>")}
          className="px-2 py-1 rounded hover:bg-gray-200"
        >
          H3
        </button>
        <button
          type="button"
          onClick={() => exec("formatBlock", "<p>")}
          className="px-2 py-1 rounded hover:bg-gray-200"
        >
          P
        </button>
        <span className="h-4 w-px bg-gray-300 mx-1" />
        <button
          type="button"
          onClick={() => exec("insertUnorderedList")}
          className="px-2 py-1 rounded hover:bg-gray-200"
        >
          • List
        </button>
        <button
          type="button"
          onClick={() => exec("insertOrderedList")}
          className="px-2 py-1 rounded hover:bg-gray-200"
        >
          1. List
        </button>
        <span className="h-4 w-px bg-gray-300 mx-1" />
        <button
          type="button"
          onClick={() => exec("justifyLeft")}
          className="px-2 py-1 rounded hover:bg-gray-200"
        >
          Left
        </button>
        <button
          type="button"
          onClick={() => exec("justifyCenter")}
          className="px-2 py-1 rounded hover:bg-gray-200"
        >
          Center
        </button>
        <button
          type="button"
          onClick={() => exec("justifyRight")}
          className="px-2 py-1 rounded hover:bg-gray-200"
        >
          Right
        </button>
        <span className="h-4 w-px bg-gray-300 mx-1" />
        <button
          type="button"
          onClick={() => {
            const color = prompt("Text color (CSS value)", "#111827");
            if (color) exec("foreColor", color);
          }}
          className="px-2 py-1 rounded hover:bg-gray-200"
        >
          Text color
        </button>
        <button
          type="button"
          onClick={() => {
            const color = prompt("Highlight color (CSS value)", "#fef3c7");
            if (color) exec("hiliteColor", color);
          }}
          className="px-2 py-1 rounded hover:bg-gray-200"
        >
          Highlight
        </button>
        <span className="h-4 w-px bg-gray-300 mx-1" />
        <button
          type="button"
          onClick={insertLink}
          className="px-2 py-1 rounded hover:bg-gray-200"
        >
          Link
        </button>
        <button
          type="button"
          onClick={() => exec("unlink")}
          className="px-2 py-1 rounded hover:bg-gray-200"
        >
          Unlink
        </button>
        <button
          type="button"
          onClick={insertImage}
          className="px-2 py-1 rounded hover:bg-gray-200"
        >
          Image
        </button>
        <button
          type="button"
          onClick={insertTable}
          className="px-2 py-1 rounded hover:bg-gray-200"
        >
          Table
        </button>
        <span className="h-4 w-px bg-gray-300 mx-1" />
        <button
          type="button"
          onClick={() => exec("undo")}
          className="px-2 py-1 rounded hover:bg-gray-200"
        >
          Undo
        </button>
        <button
          type="button"
          onClick={() => exec("redo")}
          className="px-2 py-1 rounded hover:bg-gray-200"
        >
          Redo
        </button>
        <button
          type="button"
          onClick={() => exec("removeFormat")}
          className="px-2 py-1 rounded hover:bg-gray-200"
        >
          Clear
        </button>
      </div>

      <div
        ref={editorRef}
        className="prose max-w-none px-3 py-2 text-sm text-gray-900 outline-none overflow-y-auto"
        style={{ minHeight }}
        contentEditable
        suppressContentEditableWarning
        onInput={() => {
          const el = editorRef.current;
          if (!el) return;
          applyListStyling(el);
          onChange(el.innerHTML);
        }}
        data-placeholder={placeholder}
      />

      <textarea
        name={name}
        value={value}
        readOnly
        className="hidden"
        aria-hidden="true"
      />
    </div>
  );
}
