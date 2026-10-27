import { useState, lazy, Suspense } from "react";
import { motion as Motion } from "framer-motion";
import {
  Play,
  ExternalLink,
  Maximize2,
  Copy,
  Check,
  ArrowLeft,
  Flame,
  Bug,
  Cpu,
  Users,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";

// Lazy-load Sandpack only when user clicks "Run"
const SandpackProvider = lazy(() =>
  import("@codesandbox/sandpack-react").then((m) => ({ default: m.SandpackProvider }))
);
const SandpackLayout = lazy(() =>
  import("@codesandbox/sandpack-react").then((m) => ({ default: m.SandpackLayout }))
);
const SandpackCodeEditor = lazy(() =>
  import("@codesandbox/sandpack-react").then((m) => ({ default: m.SandpackCodeEditor }))
);
const SandpackPreview = lazy(() =>
  import("@codesandbox/sandpack-react").then((m) => ({ default: m.SandpackPreview }))
);
const SandpackConsole = lazy(() =>
  import("@codesandbox/sandpack-react").then((m) => ({ default: m.SandpackConsole }))
);

const NON_RUNNABLE_LANGS = [
  "python", "py",
  "java",
  "cpp", "c++", "c",
  "rust", "rs",
  "go", "golang",
  "sql",
];

const renderReactionIcon = (type) => {
  switch (type) {
    case "fire":
      return <Flame size={13} className="text-[#ccff00]" />;
    case "bug":
      return <Bug size={13} className="text-red-400" />;
    case "clever":
      return <Cpu size={13} className="text-[#b266ff]" />;
    case "collab":
      return <Users size={13} className="text-[#38bdf8]" />;
    default:
      return null;
  }
};

const SnippetEmbed = ({ post }) => {
  const navigate = useNavigate();
  const [isLive, setIsLive] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [copied, setCopied] = useState(false);

  const code = post.codeSnippet?.code || post.content || "";
  const rawLanguage = post.codeSnippet?.language || "javascript";
  const title = post.content?.slice(0, 80) || "Code Snippet";
  const tags = post.stackTags || [];

  // Detect language and correct common mislabeling
  let effectiveLang = rawLanguage.toLowerCase();
  if (effectiveLang === "javascript" || effectiveLang === "js") {
    if (code.includes("public class ") || code.includes("public static void main") || code.includes("System.out.println")) {
      effectiveLang = "java";
    } else if ((code.includes("def ") && code.includes("print(")) || code.includes("import sys") || code.includes("if __name__ ==")) {
      effectiveLang = "python";
    } else if (code.includes("#include")) {
      effectiveLang = "cpp";
    }
  }

  const isNonRunnable = NON_RUNNABLE_LANGS.includes(effectiveLang);
  const isRunnable = !isNonRunnable;

  const totalReactions =
    (post.reactions?.fire || 0) +
    (post.reactions?.bug || 0) +
    (post.reactions?.clever || 0) +
    (post.reactions?.collab || 0);

  // Find the dominant reaction type
  const dominantReaction = Object.entries(post.reactions || {})
    .filter(([key]) => ["fire", "bug", "clever", "collab"].includes(key))
    .sort(([, a], [, b]) => b - a)[0];

  // Lines to show in collapsed view
  const codeLines = code.split("\n");
  const previewCode = expanded
    ? code
    : codeLines.slice(0, 12).join("\n") + (codeLines.length > 12 ? "\n// ..." : "");

  // Map language names to Sandpack-compatible template keys
  const getSandpackTemplate = () => {
    const lang = effectiveLang.toLowerCase();
    if (["jsx", "react", "tsx"].includes(lang)) return "react";
    if (lang === "vue") return "vue";
    if (["javascript", "js"].includes(lang) && /<[A-Za-z][\s\S]*>/.test(code)) {
      return "react";
    }
    return "vanilla";
  };

  const template = getSandpackTemplate();
  const isReactTemplate = template === "react";
  const [activeTab, setActiveTab] = useState(isReactTemplate ? "preview" : "console");

  const handleRun = () => {
    setActiveTab(isReactTemplate ? "preview" : "console");
    setIsLive(true);
  };

  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy code:", err);
    }
  };

  const handleForkToSandbox = () => {
    const randomId = Math.random().toString(36).substring(2, 9);
    navigate(`/sandbox/snippet_${randomId}`, {
      state: {
        initialCode: code,
        initialLanguage: rawLanguage,
      },
    });
  };

  // Prepare code for React default export to avoid "false" or undefined component crash
  const getFormattedCode = () => {
    if (!isReactTemplate) return code;
    if (!code) return "export default function App() { return <div>No code</div>; }";
    if (/export\s+default\s+/.test(code)) {
      return code;
    }
    const compMatch = code.match(/(?:function|const|class)\s+([A-Z][A-Za-z0-9_]*)/);
    if (compMatch) {
      return `${code}\n\nexport default ${compMatch[1]};`;
    }
    if (/<[A-Za-z][\s\S]*>/.test(code)) {
      return `export default function App() {\n  return (\n    <>\n      ${code}\n    </>\n  );\n}`;
    }
    return `${code}\n\nexport default function App() {\n  return <div style={{ color: "#fff", padding: 16 }}>Code executed</div>;\n}`;
  };

  const sandpackFiles = isReactTemplate
    ? {
        [`/App.${effectiveLang === "tsx" ? "tsx" : "js"}`]: {
          code: getFormattedCode(),
          active: true,
        },
      }
    : {
        "/index.js": {
          code: code,
          active: true,
        },
      };

  return (
    <Motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="glass-card border border-white/[0.07] rounded-xl overflow-hidden bg-[#111113]"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/[0.07]">
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-[#f0f0f0] truncate">
            {title}
          </p>
          {tags.length > 0 && (
            <div className="flex gap-1.5 mt-1 flex-wrap">
              {tags.slice(0, 4).map((tag) => (
                <span
                  key={tag}
                  className="text-[10px] px-2 py-0.5 rounded-md bg-white/5 border border-white/[0.06] text-[#52525b] font-mono font-medium"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Reactions summary */}
        {totalReactions > 0 && (
          <div className="flex items-center gap-1.5 ml-3 text-xs text-[#52525b]">
            {dominantReaction && renderReactionIcon(dominantReaction[0])}
            <span className="font-mono font-bold text-[#f0f0f0]">{totalReactions}</span>
          </div>
        )}
      </div>

      {/* Code area */}
      {!isLive ? (
        <>
          {/* Static syntax-highlighted preview */}
          <div
            className="relative cursor-pointer group"
            onClick={() => setExpanded(!expanded)}
          >
            <SyntaxHighlighter
              language={effectiveLang}
              style={oneDark}
              customStyle={{
                margin: 0,
                padding: "16px",
                background: "#09090b",
                fontSize: "12px",
                lineHeight: "1.6",
                maxHeight: expanded ? "none" : "280px",
                overflow: "hidden",
              }}
              showLineNumbers
              wrapLongLines
            >
              {previewCode}
            </SyntaxHighlighter>

            {/* Fade gradient at bottom when collapsed */}
            {!expanded && codeLines.length > 12 && (
              <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-[#09090b] to-transparent pointer-events-none" />
            )}
          </div>

          {/* Action bar */}
          <div className="flex items-center gap-2 px-4 py-3 border-t border-white/[0.07] bg-[#111113]">
            {isRunnable ? (
              <button
                type="button"
                onClick={handleRun}
                className="flex items-center gap-1.5 px-3.5 py-1.5 bg-[#ccff00] text-black rounded-lg text-xs font-bold hover:bg-[#d9ff33] transition-all cursor-pointer font-mono uppercase tracking-wider"
              >
                <Play size={12} className="fill-black" />
                <span>Run</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={handleCopyCode}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-[#ccff00]/10 border border-[#ccff00]/30 text-[#ccff00] hover:bg-[#ccff00]/20 rounded-lg text-xs font-mono font-semibold transition-colors cursor-pointer"
              >
                {copied ? <Check size={12} className="text-[#ccff00]" /> : <Copy size={12} />}
                <span>{copied ? "Copied!" : "Copy Code"}</span>
              </button>
            )}

            {isRunnable && (
              <button
                type="button"
                onClick={handleCopyCode}
                className="flex items-center gap-1.5 px-3 py-1.5 text-[#52525b] hover:text-[#f0f0f0] text-xs font-medium transition-colors cursor-pointer"
              >
                {copied ? <Check size={12} className="text-[#ccff00]" /> : <Copy size={12} />}
                <span>{copied ? "Copied!" : "Copy Code"}</span>
              </button>
            )}

            {codeLines.length > 12 && (
              <button
                type="button"
                onClick={() => setExpanded(!expanded)}
                className="flex items-center gap-1 px-3 py-1.5 text-[#52525b] hover:text-[#f0f0f0] text-xs font-medium transition-colors cursor-pointer"
              >
                <Maximize2 size={12} />
                <span>{expanded ? "Collapse" : "Expand"}</span>
              </button>
            )}

            <div className="flex-1" />

            <button
              type="button"
              onClick={handleForkToSandbox}
              className="flex items-center gap-1 text-xs text-[#ccff00] hover:text-[#d9ff33] font-semibold transition-colors cursor-pointer mr-2 font-mono"
            >
              <ExternalLink size={12} />
              <span>Fork to Sandbox</span>
            </button>

            <span className="text-[10px] text-[#52525b] font-mono uppercase">
              {rawLanguage}
            </span>
          </div>
        </>
      ) : (
        /* Live Sandpack environment - lazy loaded */
        <Suspense
          fallback={
            <div className="flex items-center justify-center py-20 bg-[#09090b]">
              <div className="w-5 h-5 border-2 border-[#ccff00] border-t-transparent rounded-full animate-spin" />
              <span className="ml-3 text-xs font-mono text-[#52525b] uppercase tracking-wider">
                Loading sandbox...
              </span>
            </div>
          }
        >
          <div className="bg-[#09090b]">
            <SandpackProvider
              template={template}
              files={sandpackFiles}
              theme="dark"
              options={{
                autorun: true,
                autoReload: true,
              }}
            >
              <SandpackLayout>
                <div className="w-full md:w-1/2 border-r border-white/[0.07]">
                  <SandpackCodeEditor
                    showLineNumbers
                    showInlineErrors
                    style={{ height: "300px" }}
                  />
                </div>
                <div className="w-full md:w-1/2 flex flex-col min-w-0" style={{ height: "300px" }}>
                  <div className="flex items-center gap-1 px-3 py-1.5 bg-[#111113] border-b border-white/[0.07] text-xs">
                    <button
                      type="button"
                      onClick={() => setActiveTab("preview")}
                      className={`px-2.5 py-1 rounded-md font-mono text-xs transition-colors cursor-pointer ${
                        activeTab === "preview"
                          ? "bg-[#ccff00]/15 text-[#ccff00] font-bold"
                          : "text-[#52525b] hover:text-[#f0f0f0]"
                      }`}
                    >
                      Preview
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveTab("console")}
                      className={`px-2.5 py-1 rounded-md font-mono text-xs transition-colors cursor-pointer ${
                        activeTab === "console"
                          ? "bg-[#ccff00]/15 text-[#ccff00] font-bold"
                          : "text-[#52525b] hover:text-[#f0f0f0]"
                      }`}
                    >
                      Console
                    </button>
                  </div>
                  <div className="flex-1 relative overflow-auto">
                    <div style={{ display: activeTab === "preview" ? "block" : "none", height: "100%" }}>
                      <SandpackPreview style={{ height: "260px" }} />
                    </div>
                    <div style={{ display: activeTab === "console" ? "block" : "none", height: "100%" }}>
                      <SandpackConsole style={{ height: "260px" }} />
                    </div>
                  </div>
                </div>
              </SandpackLayout>
            </SandpackProvider>

            {/* Exit live mode */}
            <div className="flex items-center gap-2 px-4 py-2 border-t border-white/[0.07] bg-[#111113]">
              <button
                type="button"
                onClick={() => setIsLive(false)}
                className="flex items-center gap-1 text-xs text-[#52525b] hover:text-[#f0f0f0] font-mono transition-colors cursor-pointer"
              >
                <ArrowLeft size={12} />
                <span>Back to preview</span>
              </button>
              <div className="flex-1" />
              <button
                type="button"
                onClick={handleForkToSandbox}
                className="flex items-center gap-1 text-xs text-[#ccff00] hover:text-[#d9ff33] font-mono font-semibold transition-colors cursor-pointer"
              >
                <ExternalLink size={12} />
                <span>Fork to Sandbox</span>
              </button>
            </div>
          </div>
        </Suspense>
      )}
    </Motion.div>
  );
};

export default SnippetEmbed;
