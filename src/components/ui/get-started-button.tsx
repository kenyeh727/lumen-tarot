import { Button } from "@/components/ui/button";
import { ChevronRight } from "lucide-react";

export function GetStartedButton({ onClick }: { onClick?: () => void }) {
    return (
        <Button
            className="group relative overflow-hidden h-14 w-60 rounded-full bg-primary hover:bg-primary/90 text-white border-0"
            size="lg"
            onClick={onClick}
        >
            <span className="mr-8 transition-opacity duration-500 group-hover:opacity-0 text-sm font-bold uppercase tracking-widest">
                Get Started
            </span>
            <i className="absolute right-1 top-1 bottom-1 rounded-full z-10 grid w-1/4 place-items-center transition-all duration-500 bg-primary-foreground/15 group-hover:w-[calc(100%-0.5rem)] group-active:scale-95 text-white">
                <ChevronRight size={16} strokeWidth={2} aria-hidden="true" />
            </i>
        </Button>
    );
}
