import { ChevronRight } from "lucide-react";
import * as Icons from "lucide-react";

interface Section {
  id: string;
  title: string;
  icon: string;
  summary: string;
  chips?: string[];
  hoverColor: string;
}

interface SectionGridProps {
  sections: Section[];
  onSectionClick: (sectionId: string) => void;
}

export const SectionGrid = ({ sections, onSectionClick }: SectionGridProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {sections.map((section, idx) => {
        const IconComponent = Icons[section.icon as keyof typeof Icons] as any;
        
        return (
          <button
            key={section.id}
            onClick={() => onSectionClick(section.id)}
            className={`group bg-card border border-border rounded-xl p-5 text-left transition-all duration-smooth hover:shadow-elegant hover:border-secondary/30 ${section.hoverColor} animate-fade-up`}
            style={{ animationDelay: `${(idx + 2) * 40}ms` }}
          >
            <div className="flex items-start gap-4">
              {/* Icon */}
              <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-primary flex items-center justify-center">
                {IconComponent && (
                  <IconComponent className="h-5 w-5 text-primary-foreground" />
                )}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0 space-y-2">
                <h3 className="font-semibold text-foreground text-base tracking-tight">
                  {section.title}
                </h3>
                <p className="text-sm text-secondary line-clamp-2">
                  {section.summary}
                </p>
                
                {section.chips && section.chips.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {section.chips.slice(0, 3).map((chip, chipIdx) => (
                      <span
                        key={chipIdx}
                        className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium bg-muted text-muted-foreground group-hover:bg-primary/20 transition-colors duration-smooth animate-scale-in"
                        style={{ animationDelay: `${(idx + chipIdx) * 60}ms` }}
                      >
                        {chip}
                      </span>
                    ))}
                    {section.chips.length > 3 && (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium text-secondary">
                        +{section.chips.length - 3} more
                      </span>
                    )}
                  </div>
                )}
              </div>

              {/* Chevron */}
              <ChevronRight className="flex-shrink-0 h-5 w-5 text-secondary group-hover:text-foreground group-hover:translate-x-1 transition-all duration-smooth" />
            </div>
          </button>
        );
      })}
    </div>
  );
};