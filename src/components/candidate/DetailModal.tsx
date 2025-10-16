import { X, Download, Link as LinkIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";

interface DetailModalProps {
  section: string;
  candidate: any;
  onClose: () => void;
}

export const DetailModal = ({ section, candidate, onClose }: DetailModalProps) => {
  const sectionData = candidate.sectionDetails[section];
  
  if (!sectionData) return null;

  return (
    <Dialog open={!!section} onOpenChange={onClose}>
      <DialogContent className="max-w-[880px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-2xl font-bold tracking-tighter">
              {sectionData.title}
            </DialogTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="h-8 w-8 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          {sectionData.items?.map((item: any, idx: number) => (
            <div
              key={idx}
              className="p-5 bg-muted/30 rounded-lg border border-border space-y-3"
            >
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-semibold text-foreground text-lg">
                    {item.title}
                  </h3>
                  {item.subtitle && (
                    <p className="text-sm text-secondary mt-1">{item.subtitle}</p>
                  )}
                </div>
                {item.verified && (
                  <Badge className="bg-success/20 text-success-foreground border-success/30">
                    ✅ Verified
                  </Badge>
                )}
              </div>

              {item.description && (
                <p className="text-sm text-secondary leading-relaxed">
                  {item.description}
                </p>
              )}

              {item.details && (
                <div className="grid grid-cols-2 gap-3 text-sm">
                  {Object.entries(item.details).map(([key, value]) => (
                    <div key={key}>
                      <span className="text-secondary">{key}: </span>
                      <span className="text-foreground font-medium">{value as string}</span>
                    </div>
                  ))}
                </div>
              )}

              {item.chips && (
                <div className="flex flex-wrap gap-2">
                  {item.chips.map((chip: string, chipIdx: number) => (
                    <Badge key={chipIdx} variant="outline" className="text-xs">
                      {chip}
                    </Badge>
                  ))}
                </div>
              )}

              {item.files && (
                <div className="flex flex-wrap gap-2">
                  {item.files.map((file: any, fileIdx: number) => (
                    <Button
                      key={fileIdx}
                      variant="outline"
                      size="sm"
                      className="gap-2"
                    >
                      <Download className="h-3 w-3" />
                      {file.name}
                    </Button>
                  ))}
                </div>
              )}

              {item.links && (
                <div className="flex flex-wrap gap-2">
                  {item.links.map((link: any, linkIdx: number) => (
                    <Button
                      key={linkIdx}
                      variant="outline"
                      size="sm"
                      className="gap-2"
                      asChild
                    >
                      <a href={link.url} target="_blank" rel="noopener noreferrer">
                        <LinkIcon className="h-3 w-3" />
                        {link.label}
                      </a>
                    </Button>
                  ))}
                </div>
              )}
            </div>
          ))}

          {sectionData.empty && (
            <div className="text-center py-8 text-secondary">
              <p className="text-sm">Nothing here yet.</p>
              <p className="text-xs mt-1">Ask candidate to update this section.</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
