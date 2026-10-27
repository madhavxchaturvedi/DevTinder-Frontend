import React from "react";
import { useNavigate } from "react-router-dom";
import { FileQuestion, Home, ArrowLeft, Compass, Terminal } from "lucide-react";
import { Button } from "@/components/ui/button";

const NotFoundPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-dvh w-full flex flex-col items-center justify-center p-6 bg-background text-foreground transition-colors">
      <div className="w-full max-w-md text-center">
        {/* Glow & Icon */}
        <div className="relative mx-auto w-24 h-24 mb-6 flex items-center justify-center">
          <div className="absolute inset-0 rounded-3xl bg-primary/20 blur-xl animate-pulse" />
          <div className="relative w-24 h-24 rounded-3xl bg-card border border-border flex items-center justify-center shadow-xl">
            <FileQuestion className="h-12 w-12 text-primary" />
          </div>
        </div>

        {/* 404 Tag */}
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-mono font-bold uppercase tracking-widest mb-4">
          <Terminal className="h-3.5 w-3.5" />
          Error 404
        </div>

        {/* Heading */}
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground mb-3">
          Page Not Found
        </h1>

        {/* Description */}
        <p className="text-sm sm:text-base text-muted-foreground mb-8 leading-relaxed max-w-sm mx-auto">
          The route you are looking for has been pruned or does not exist on OctoPair.
        </p>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 w-full">
          <Button
            onClick={() => navigate("/feed")}
            className="w-full sm:w-auto font-bold gap-2"
          >
            <Home className="h-4 w-4" />
            Return to Feed
          </Button>

          <Button
            onClick={() => navigate("/discover")}
            variant="outline"
            className="w-full sm:w-auto font-semibold gap-2"
          >
            <Compass className="h-4 w-4" />
            Discover Devs
          </Button>
        </div>

        <div className="mt-8">
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors font-medium"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Go back to previous page
          </button>
        </div>
      </div>
    </div>
  );
};

export default NotFoundPage;
